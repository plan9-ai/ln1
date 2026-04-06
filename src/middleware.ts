import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/app.config";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refresh the auth token on every request
  await supabase.auth.getUser();

  // If there's a `code` param and we're NOT on /auth/callback, redirect there
  const { searchParams, pathname } = request.nextUrl;
  const code = searchParams.get("code");
  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    // Preserve the code and add next param for password reset
    url.searchParams.set("code", code);
    if (!url.searchParams.has("next")) {
      url.searchParams.set("next", "/reset-password");
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
