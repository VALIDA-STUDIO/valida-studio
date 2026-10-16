import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Starts the Discord OAuth flow; route handlers can set the PKCE cookie Supabase needs.
export async function GET() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data?.url) return NextResponse.redirect(`${origin}/?error=auth`);
  return NextResponse.redirect(data.url);
}
