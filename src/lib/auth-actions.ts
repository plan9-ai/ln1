"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  email: string,
  password: string,
  callbackUrl?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: { message: error.message } };
  }

  redirect(callbackUrl ?? "/app");
}

export async function signUp(email: string, password: string, name?: string) {
  console.log("[signUp] Registered email:", email);

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name ?? email.split("@")[0] },
  });

  if (error) {
    return { error: { message: error.message } };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: { message: signInError.message } };
  }

  redirect("/app");
}

export async function signOut(callbackUrl?: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(
    callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login"
  );
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient();
  const { appConfig } = await import("@/app.config");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appConfig.BASE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function resetPassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: { message: error.message } };
  }

  redirect("/app");
}
