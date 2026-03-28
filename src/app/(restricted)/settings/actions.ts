"use server";

import { Resend } from "resend";
import { appConfig } from "@/app.config";
import { getAuthSession } from "@/lib/auth";

export async function sendVerificationEmail() {
  const session = await getAuthSession();

  if (!session?.user.email) {
    return { error: { message: "Not authenticated" } };
  }

  const resend = new Resend(appConfig.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [session.user.email],
    subject: "Email Verification",
    html: `
      <p>This is a verification email from LN1.</p>
      <p>If you received this email, your email address is confirmed.</p>
    `,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}
