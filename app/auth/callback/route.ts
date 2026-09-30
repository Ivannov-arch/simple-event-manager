import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

/**
 * Google OAuth Callback Route Handler
 *
 * After the user authenticates with Google, they are redirected here
 * with a `code` query param. This handler exchanges the code for a
 * Supabase session and sets the auth cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` can be used to redirect the user to a specific page after login
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // In local dev, trust the origin directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // In production behind a proxy/load balancer, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If the code is missing or exchange fails, redirect to error page
  return NextResponse.redirect(`${origin}/auth/error`);
}
