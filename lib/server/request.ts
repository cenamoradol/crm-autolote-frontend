import { headers } from "next/headers";

/**
 * Host header tal cual (puede traer puerto)
 * - En Vercel: x-forwarded-host
 * - Local: host
 */
export async function getRequestHostHeader(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-host") || h.get("host") || "").trim();
}

/**
 * Protocolo real (Vercel manda x-forwarded-proto)
 */
export async function getRequestProtocol(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-proto") || "http").trim();
}

/**
 * Origin completo: https://crmautolo.com | http://localhost:3001
 */
export async function getRequestOrigin(): Promise<string> {
  const host = await getRequestHostHeader();
  const proto = await getRequestProtocol();
  return `${proto}://${host}`;
}
