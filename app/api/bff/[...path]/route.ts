// app/api/bff/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_SA_STORE, cookieBaseOptions } from "@/lib/cookies";
import { normalizeHost, isMasterHost } from "@/lib/host";

const isUUID = (v?: string) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

type RouteCtx = { params: Promise<{ path: string[] }> | { path: string[] } };

// ✅ IMPORTANTE: anotamos retorno para evitar implicit any en recursión
async function forward(
  req: Request,
  pathWithSearch: string,
  accessToken?: string,
  bodyRaw?: ArrayBuffer,
  retry = false
): Promise<Response> {
  const backend = process.env.BACKEND_URL!;
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") || h.get("host") || "");
  const master = isMasterHost(host);

  const url = `${backend}/${pathWithSearch}`;

  const outgoing = new Headers(req.headers);

  // limpiar
  outgoing.delete("host");
  outgoing.delete("content-length");

  // forzar host real
  outgoing.set("x-forwarded-host", host);

  // auth
  if (accessToken) outgoing.set("authorization", `Bearer ${accessToken}`);

  // x-store-id SOLO master + cookie soporte
  const ck = await cookies();
  const saStore = ck.get(COOKIE_SA_STORE)?.value;

  if (master && isUUID(saStore)) outgoing.set("x-store-id", saStore!);
  else outgoing.delete("x-store-id");

  const method = req.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: outgoing,
    body: ["GET", "HEAD"].includes(method) ? undefined : bodyRaw
  };

  const res = await fetch(url, init);

  // refresh 1 vez si 401
  if (res.status === 401 && !retry) {
    const refreshToken = ck.get(COOKIE_REFRESH)?.value;
    if (!refreshToken) return res;

    const r = await fetch(`${backend}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-host": host
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!r.ok) return res;

    const refreshed = (await r.json().catch(() => null)) as { accessToken?: string } | null;
    if (!refreshed?.accessToken) return res;

    // reintentar (re-usa el mismo bodyRaw)
    const second = await forward(req, pathWithSearch, refreshed.accessToken, bodyRaw, true);

    // devolver la respuesta con cookie actualizada
    const bodyJson = await second.clone().json().catch(() => null);
    const next = NextResponse.json(bodyJson ?? (await second.text()), { status: second.status });

    next.cookies.set(COOKIE_ACCESS, refreshed.accessToken, {
      ...cookieBaseOptions(),
      maxAge: 60 * 15
    });

    return next;
  }

  return res;
}

async function handle(req: Request, pathArr: string[]): Promise<Response> {
  const ck = await cookies();
  const access = ck.get(COOKIE_ACCESS)?.value;

  // conservar querystring (?status=&q=&page=...)
  const u = new URL(req.url);
  const path = pathArr.join("/");
  const pathWithSearch = `${path}${u.search}`;

  // ✅ leer body 1 sola vez (sirve para JSON y multipart/form-data)
  const method = req.method.toUpperCase();
  const bodyRaw = ["GET", "HEAD"].includes(method) ? undefined : await req.arrayBuffer();

  const res = await forward(req, pathWithSearch, access, bodyRaw);

  // normalizamos a JSON siempre (si viene HTML, lo envolvemos)
  const data = await res.json().catch(async () => ({ raw: await res.text() }));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: Request, ctx: RouteCtx) {
  const { path } = await (ctx.params as any);
  return handle(req, path);
}
export async function POST(req: Request, ctx: RouteCtx) {
  const { path } = await (ctx.params as any);
  return handle(req, path);
}
export async function PATCH(req: Request, ctx: RouteCtx) {
  const { path } = await (ctx.params as any);
  return handle(req, path);
}
export async function DELETE(req: Request, ctx: RouteCtx) {
  const { path } = await (ctx.params as any);
  return handle(req, path);
}
export async function PUT(req: Request, ctx: RouteCtx) {
  const { path } = await (ctx.params as any);
  return handle(req, path);
}
