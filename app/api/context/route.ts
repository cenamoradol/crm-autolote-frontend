import { NextResponse } from "next/server";
import { normalizeHost } from "@/lib/host";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const backend = process.env.BACKEND_URL!;
  const host = normalizeHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || "");

  const res = await fetch(`${backend}/context`, {
    headers: { "x-forwarded-host": host },
    cache: "no-store"
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
