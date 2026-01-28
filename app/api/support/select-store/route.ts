import { NextResponse } from "next/server";
import { COOKIE_SA_STORE, cookieBaseOptions } from "@/lib/cookies";

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const storeId = String(body?.storeId ?? "").trim();

  if (!storeId) {
    return NextResponse.json({ message: "storeId required" }, { status: 400 });
  }

  if (!isUUID(storeId)) {
    return NextResponse.json({ message: "storeId must be a UUID" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SA_STORE, storeId, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
