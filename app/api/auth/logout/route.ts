import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_SA_STORE } from "@/lib/cookies";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url.origin));

  const cookieOptions = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: url.protocol === "https:"
  };

  // Borrar tokens con todas las opciones posibles
  res.cookies.set(COOKIE_ACCESS, "", cookieOptions);
  res.cookies.set(COOKIE_REFRESH, "", cookieOptions);
  res.cookies.set(COOKIE_SA_STORE, "", cookieOptions);

  // Limpiar cualquier otra cookie de sesión que pudiera existir
  res.cookies.set("crmautolo_session", "", cookieOptions);

  return res;
}
