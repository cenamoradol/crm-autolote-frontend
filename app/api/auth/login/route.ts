import { NextResponse } from "next/server";
import { cookieBaseOptions, COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/cookies";
import { normalizeHost } from "@/lib/host";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; fullName: string | null; isSuperAdmin: boolean };
  context: any;
};

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL!;
  const host = normalizeHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || "");

  const body = await req.json();

  const res = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-host": host
    },
    body: JSON.stringify(body)
  });

  const data = (await res.json().catch(() => null)) as LoginResponse | null;

  if (!res.ok || !data) {
    return NextResponse.json(data || { message: "Login failed" }, { status: res.status });
  }

  const response = NextResponse.json({
    user: data.user,
    context: data.context
  });

  response.cookies.set(COOKIE_ACCESS, data.accessToken, {
    ...cookieBaseOptions(),
    maxAge: 60 * 15
  });

  response.cookies.set(COOKIE_REFRESH, data.refreshToken, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
