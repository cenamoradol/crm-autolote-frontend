import type { SearchOption } from "@/components/ui/SearchSelect";
import { apiFetch } from "@/lib/api";

function extractArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input?.results)) return input.results;
  return [];
}

function pickLabel(...parts: Array<string | null | undefined>) {
  const s = parts.map((x) => (x ?? "").trim()).filter(Boolean).join(" · ");
  return s || "(Sin nombre)";
}

function toOption(id: string, label: string, sublabel?: string): SearchOption {
  return { id, label: label || "(Sin nombre)", sublabel: sublabel || undefined };
}

// ---------------- Customers ----------------
export async function searchCustomers(q: string): Promise<SearchOption[]> {
  const qs = new URLSearchParams();
  if (q?.trim()) qs.set("q", q.trim());
  qs.set("limit", "10");
  qs.set("page", "1");

  const raw = await apiFetch<any>(`/customers?${qs.toString()}`);
  const arr = extractArray(raw);

  return arr
    .map((c: any) => {
      const id = String(c?.id ?? "");
      if (!id) return null;

      const fullName = c?.fullName ?? c?.full_name ?? "";
      const phone = c?.phone ?? "";
      const email = c?.email ?? "";

      return toOption(id, fullName || phone || email || id, pickLabel(phone, email));
    })
    .filter(Boolean) as SearchOption[];
}

// ---------------- Leads ----------------
export async function searchLeads(q: string): Promise<SearchOption[]> {
  const qs = new URLSearchParams();
  if (q?.trim()) qs.set("q", q.trim());
  qs.set("limit", "10");
  qs.set("page", "1");
  qs.set("sortBy", "createdAt");
  qs.set("sortDir", "desc");

  const raw = await apiFetch<any>(`/leads?${qs.toString()}`);
  const arr = extractArray(raw);

  return arr
    .map((l: any) => {
      const id = String(l?.id ?? "");
      if (!id) return null;

      const name = l?.fullName ?? l?.full_name ?? "";
      const phone = l?.phone ?? "";
      const email = l?.email ?? "";
      const status = l?.status ?? "";

      const label = name || phone || email || id;
      const sub = pickLabel(status ? `Status: ${status}` : "", phone, email);

      return toOption(id, label, sub);
    })
    .filter(Boolean) as SearchOption[];
}

// ---------------- Vehicles ----------------
// Tu backend NO soporta ?q= en /vehicles, así que filtramos aquí.
export async function searchVehicles(q: string): Promise<SearchOption[]> {
  const raw = await apiFetch<any>(`/vehicles`);
  const arr = extractArray(raw);

  const needle = (q ?? "").trim().toLowerCase();

  const filtered = needle
    ? arr.filter((v: any) => {
        const title = String(v?.title ?? "").toLowerCase();
        const publicId = String(v?.publicId ?? v?.public_id ?? "").toLowerCase();
        const brand = String(v?.brand?.name ?? "").toLowerCase();
        const model = String(v?.model?.name ?? "").toLowerCase();
        const year = String(v?.year ?? "").toLowerCase();
        return (
          title.includes(needle) ||
          publicId.includes(needle) ||
          brand.includes(needle) ||
          model.includes(needle) ||
          year.includes(needle)
        );
      })
    : arr;

  return filtered
    .slice(0, 10)
    .map((v: any) => {
      const id = String(v?.id ?? "");
      if (!id) return null;

      const title = v?.title ?? "";
      const year = v?.year ? String(v.year) : "";
      const publicId = v?.publicId ?? v?.public_id ?? "";
      const status = v?.status ?? "";

      const brandName = v?.brand?.name ?? "";
      const modelName = v?.model?.name ?? "";

      const label =
        title ||
        [brandName, modelName, year].filter(Boolean).join(" ") ||
        publicId ||
        id;

      const sub = pickLabel(
        status ? `Status: ${status}` : "",
        publicId ? `ID público: ${publicId}` : ""
      );

      return toOption(id, label, sub);
    })
    .filter(Boolean) as SearchOption[];
}

// ---------------- Branches ----------------
export async function searchBranches(q: string): Promise<SearchOption[]> {
  const qs = new URLSearchParams();
  if (q?.trim()) qs.set("q", q.trim());
  qs.set("limit", "20");
  qs.set("page", "1");

  const raw = await apiFetch<any>(`/branches?${qs.toString()}`);
  const arr = extractArray(raw);

  return arr
    .map((b: any) => {
      const id = String(b?.id ?? "");
      if (!id) return null;

      const name = b?.name ?? "";
      const address = b?.address ?? "";

      return toOption(id, name || id, address ? `📍 ${address}` : undefined);
    })
    .filter(Boolean) as SearchOption[];
}

// ---------------- Brands ----------------
export async function searchBrands(q: string): Promise<SearchOption[]> {
  const qs = new URLSearchParams();
  if (q?.trim()) qs.set("q", q.trim());
  qs.set("limit", "20");
  qs.set("page", "1");

  const raw = await apiFetch<any>(`/brands?${qs.toString()}`);
  const arr = extractArray(raw);

  return arr
    .map((b: any) => {
      const id = String(b?.id ?? "");
      if (!id) return null;

      const name = b?.name ?? "";
      return toOption(id, name || id);
    })
    .filter(Boolean) as SearchOption[];
}

// ---------------- Models (dependen de brand) ----------------
export async function searchModels(brandId: string, q: string): Promise<SearchOption[]> {
  if (!brandId) return [];

  try {
    const qs = new URLSearchParams();
    qs.set("brandId", brandId);
    if (q?.trim()) qs.set("q", q.trim());
    qs.set("limit", "20");
    qs.set("page", "1");

    const raw = await apiFetch<any>(`/models?${qs.toString()}`);
    const arr = extractArray(raw);

    return arr
      .map((m: any) => {
        const id = String(m?.id ?? "");
        if (!id) return null;
        const name = m?.name ?? "";
        return toOption(id, name || id);
      })
      .filter(Boolean) as SearchOption[];
  } catch {
    const qs2 = new URLSearchParams();
    if (q?.trim()) qs2.set("q", q.trim());
    qs2.set("limit", "20");
    qs2.set("page", "1");

    const raw2 = await apiFetch<any>(`/brands/${brandId}/models?${qs2.toString()}`);
    const arr2 = extractArray(raw2);

    return arr2
      .map((m: any) => {
        const id = String(m?.id ?? "");
        if (!id) return null;
        const name = m?.name ?? "";
        return toOption(id, name || id);
      })
      .filter(Boolean) as SearchOption[];
  }
}
