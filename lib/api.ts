export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const res = await fetch(`/api/bff${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" })
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}
