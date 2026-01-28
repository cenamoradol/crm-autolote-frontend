import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_SA_STORE } from "@/lib/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
  res.cookies.delete(COOKIE_SA_STORE);
  return res;
}
