import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Plain form POST (full browser navigation) so the redirect chain to Discord is followed natively.
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`, 303);
}
