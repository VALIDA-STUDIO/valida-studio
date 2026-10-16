import { NextResponse } from "next/server";

// Design preview only: /dev/plan?set=premium or /dev/plan?set=default
export async function GET(request) {
  const plan = new URL(request.url).searchParams.get("set") === "premium" ? "premium" : "default";
  const res = NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL);
  res.cookies.set("plan", plan, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
