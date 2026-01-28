// lib/sales.ts
export type Sale = {
  id: string;
  storeId: string;
  vehicleId: string;
  soldByUserId: string;
  customerId: string | null;
  leadId: string | null;
  soldAt: string; // ISO
  soldPrice: string | null; // string numeric
  notes: string | null;

  vehicle?: {
    id: string;
    publicId?: string | null;
    title?: string | null;
    year?: number | null;
    brandId?: string;
    modelId?: string;

    brand?: { id: string; name: string } | null;
    model?: { id: string; name: string } | null;
    branch?: { id: string; name: string } | null;
  } | null;

  customer?: { id: string; fullName: string; phone?: string | null; email?: string | null } | null;
  lead?: { id: string; fullName?: string | null; phone?: string | null; email?: string | null; status?: string | null } | null;
  soldBy?: { id: string; email?: string | null; fullName?: string | null } | null;
};

const API = "/api/bff";

function normalizeSalesPayload(json: any): Sale[] {
  if (Array.isArray(json)) return json as Sale[];
  if (Array.isArray(json?.data)) return json.data as Sale[];
  if (Array.isArray(json?.items)) return json.items as Sale[];
  return [];
}

export async function fetchAllSales(): Promise<Sale[]> {
  const res = await fetch(`${API}/sales`, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
  return normalizeSalesPayload(json);
}

export async function getSaleFromList(id: string): Promise<Sale | null> {
  const all = await fetchAllSales();
  return all.find((x) => x.id === id) ?? null;
}

export function toNumber(v: any): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function money(v: any) {
  const n = toNumber(v);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function safeStr(v: any) {
  return (v ?? "").toString();
}

export type SalesFilters = {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  brandId?: string;
  modelId?: string;
  sellerId?: string;
  q?: string;
};

function startOfDayLocal(dateStr: string) {
  // YYYY-MM-DD en local
  const [y, m, d] = dateStr.split("-").map((x) => Number(x));
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}
function endOfDayLocal(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map((x) => Number(x));
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999);
}

export function applySalesFilters(all: Sale[], f: SalesFilters): Sale[] {
  const q = (f.q ?? "").trim().toLowerCase();

  const fromD = f.from ? startOfDayLocal(f.from) : null;
  const toD = f.to ? endOfDayLocal(f.to) : null;

  const out = all.filter((s) => {
    // date range
    if (fromD || toD) {
      const d = new Date(s.soldAt);
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
    }

    // seller
    if (f.sellerId && s.soldByUserId !== f.sellerId) return false;

    // brand/model (viene en vehicle.brandId o vehicle.brand.id)
    const brandId = s.vehicle?.brandId || s.vehicle?.brand?.id;
    const modelId = s.vehicle?.modelId || s.vehicle?.model?.id;

    if (f.brandId && brandId !== f.brandId) return false;
    if (f.modelId && modelId !== f.modelId) return false;

    // search text
    if (q) {
      const haystack = [
        s.vehicle?.title,
        s.vehicle?.publicId,
        s.vehicle?.brand?.name,
        s.vehicle?.model?.name,
        s.customer?.fullName,
        s.customer?.phone,
        s.customer?.email,
        s.lead?.fullName,
        s.lead?.phone,
        s.lead?.email,
        s.soldBy?.fullName,
        s.soldBy?.email,
        s.notes,
      ]
        .filter(Boolean)
        .map((x) => safeStr(x).toLowerCase())
        .join(" | ");

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  // orden por fecha desc
  out.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());
  return out;
}

export function summarizeSales(list: Sale[]) {
  const totalSales = list.length;
  const totalAmount = list.reduce((acc, s) => acc + toNumber(s.soldPrice), 0);
  return { totalSales, totalAmount };
}

export function groupBySeller(list: Sale[]) {
  const map = new Map<
    string,
    { sellerId: string; sellerName: string; count: number; amount: number }
  >();

  for (const s of list) {
    const id = s.soldByUserId;
    const name = s.soldBy?.fullName || s.soldBy?.email || id;
    const current = map.get(id) ?? { sellerId: id, sellerName: name, count: 0, amount: 0 };
    current.count += 1;
    current.amount += toNumber(s.soldPrice);
    map.set(id, current);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
