import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_ACCESS, COOKIE_SA_STORE } from "./lib/cookies";
import { normalizeHost, isMasterHost } from "./lib/host";

const PUBLIC_PATHS = ["/login", "/domain-not-found"];

const STORE_SCOPED_PATHS = [
  "/dashboard",
  "/inventory",
  "/customers",
  "/leads",
  "/activities",
  "/sales",
  "/settings",
  "/billing"
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isStoreScoped(pathname: string) {
  return STORE_SCOPED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// ✅ middleware() ahora es proxy()
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals + static + api
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const host = normalizeHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || "");
  const master = isMasterHost(host);

  // ✅ FIX: Block /sa SOLO si es "/sa" o "/sa/..."
  // (Evita bloquear "/sales")
  if (!master && (pathname === "/sa" || pathname.startsWith("/sa/"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/inventory";
    return NextResponse.redirect(url);
  }

  const access = req.cookies.get(COOKIE_ACCESS)?.value;

  // Auth guard (solo verifica existencia de cookie; el backend valida permisos)
  if (!access && !isPublic(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Master support guard: require selected store for store-scoped pages
  if (master && isStoreScoped(pathname) && !pathname.startsWith("/support/select-store")) {
    const saStore = req.cookies.get(COOKIE_SA_STORE)?.value;
    if (!saStore) {
      const url = req.nextUrl.clone();
      url.pathname = "/support/select-store";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
