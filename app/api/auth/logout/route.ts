import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_SA_STORE } from "@/lib/cookies";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url.origin));
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
  res.cookies.delete(COOKIE_SA_STORE);
  return res;
}
