import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Dev only: signs in with a magic-link token hash so screenshots can be taken headlessly.
// Requires the DEV_LOGIN_SECRET from .env.local; remove this route before launch.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!process.env.DEV_LOGIN_SECRET || searchParams.get("s") !== process.env.DEV_LOGIN_SECRET) {
    return new NextResponse("Not found", { status: 404 });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: searchParams.get("th") ?? "", type: "magiclink" });
  if (error) return new NextResponse(`verify failed: ${error.message}`, { status: 400 });
  return NextResponse.redirect(site, 303);
}
