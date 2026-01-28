import type { TenantContext } from "@/lib/context";
import { normalizeHost } from "@/lib/host";
import { getRequestHostHeader } from "@/lib/server/request";

export async function getServerContext(): Promise<TenantContext> {
  const backend = process.env.BACKEND_URL!;
  const hostHeader = await getRequestHostHeader();
  const host = normalizeHost(hostHeader);

  if (!host) {
    return { mode: "unknown", host: "" };
  }

  const res = await fetch(`${backend}/context`, {
    headers: { "x-forwarded-host": host },
    cache: "no-store"
  });

  if (!res.ok) {
    return { mode: "unknown", host };
  }

  const data = (await res.json().catch(() => null)) as TenantContext | null;
  return data ?? { mode: "unknown", host };
}
