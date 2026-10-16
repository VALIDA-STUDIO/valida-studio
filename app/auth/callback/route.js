import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Discord redirects here (via Supabase) with a ?code= that we exchange for a session.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(origin);
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
