import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Revokes every session for this user (all devices), then sends them to Discord login.
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`, 303);
}
