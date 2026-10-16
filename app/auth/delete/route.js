import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Permanently deletes the signed-in user's account, then signs them out.
export async function POST() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(`${site}/auth/login`, 303);

  // Admin client with the secret key; never exposed to the browser.
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete account failed:", error.message);
    return NextResponse.redirect(`${site}/settings?error=delete`, 303);
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(`${site}/auth/login`, 303);
}
