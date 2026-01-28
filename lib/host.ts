export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, "");
}

export function isMasterHost(host: string): boolean {
  const list = (process.env.NEXT_PUBLIC_MASTER_DOMAINS || "")
    .split(",")
    .map(normalizeHost)
    .filter(Boolean);

  return list.includes(normalizeHost(host));
}
