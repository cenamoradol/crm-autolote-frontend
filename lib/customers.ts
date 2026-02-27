import { apiFetch } from "@/lib/api";

export type Customer = {
  id: string;
  fullName: string;

  phone?: string | null;
  email?: string | null;
  documentId?: string | null;
  status?: string;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CustomerPreference = {
  id: string;
  brandId?: string | null;
  modelId?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  brand?: { id: string; name: string } | null;
  model?: { id: string; name: string } | null;
};

export type CustomerActivity = {
  id: string;
  type: string;
  notes?: string | null;
  createdAt?: string;
  createdBy?: { id: string; fullName: string | null } | null;
};

export type CustomerSale = {
  id: string;
  soldAt?: string;
  soldPrice?: number;
  notes?: string;
  vehicle: {
    id: string;
    publicId: string;
    year?: number;
    price?: number;
    brand?: { id: string; name: string } | null;
    model?: { id: string; name: string } | null;
    media?: { url: string }[];
  };
  soldBy?: { id: string; fullName: string | null } | null;
};

export type CustomerDetail = Customer & {
  preferences: CustomerPreference[];
  activities: CustomerActivity[];
  sales: CustomerSale[];
};

export type MatchingVehicle = {
  id: string;
  publicId: string;
  status: string;
  year?: number;
  price?: number;
  mileage?: number;
  createdAt?: string;
  brand?: { id: string; name: string } | null;
  model?: { id: string; name: string } | null;
  media?: { url: string }[];
};

export type CustomerListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CustomerListResult = {
  data: Customer[];
  meta: CustomerListMeta;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeCustomer(raw: any): Customer | null {
  const id = String(raw?.id ?? "").trim();
  if (!UUID_RE.test(id)) return null;

  return {
    id,
    fullName: raw?.fullName ?? raw?.full_name ?? "",
    phone: raw?.phone ?? null,
    email: raw?.email ?? null,
    documentId: raw?.documentId ?? raw?.document_id ?? null,
    status: raw?.status ?? "ACTIVE",
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? null
  };
}

function extractArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input?.results)) return input.results;
  return [];
}

function normalizeListResult(input: any): CustomerListResult {
  const arr = extractArray(input);
  const data = arr.map(normalizeCustomer).filter((x): x is Customer => x !== null);

  const meta: CustomerListMeta = {
    page: Number(input?.meta?.page ?? 1),
    limit: Number(input?.meta?.limit ?? 20),
    total: Number(input?.meta?.total ?? data.length),
    totalPages: Number(input?.meta?.totalPages ?? 1)
  };

  return { data, meta };
}

export type CustomerQuery = {
  page?: number;
  limit?: number;
  q?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
};

export type CustomerCreateInput = {
  fullName: string;
  phone?: string | null;
  email?: string | null;
  documentId?: string | null;
};

export type CustomerUpdateInput = Partial<CustomerCreateInput>;

function sanitize(body: CustomerCreateInput | CustomerUpdateInput) {
  const out: any = {};
  if ((body as any).fullName !== undefined) out.fullName = (body as any).fullName;
  if (body.phone !== undefined) out.phone = body.phone;
  if (body.email !== undefined) out.email = body.email;
  if (body.documentId !== undefined) out.documentId = body.documentId;
  return out;
}

export async function listCustomers(query?: CustomerQuery): Promise<CustomerListResult> {
  const qs = new URLSearchParams();

  if (query?.page) qs.set("page", String(query.page));
  if (query?.limit) qs.set("limit", String(query.limit));
  if (query?.q?.trim()) qs.set("q", query.q.trim());
  if (query?.createdFrom) qs.set("createdFrom", query.createdFrom);
  if (query?.createdTo) qs.set("createdTo", query.createdTo);
  if (query?.sortBy) qs.set("sortBy", query.sortBy);
  if (query?.sortDir) qs.set("sortDir", query.sortDir);

  const raw = await apiFetch<any>(`/customers${qs.toString() ? `?${qs}` : ""}`);
  return normalizeListResult(raw);
}

export async function getCustomer(id: string): Promise<Customer> {
  const raw = await apiFetch<any>(`/customers/${id}`);
  const c = normalizeCustomer(raw);
  if (!c) throw new Error("Customer inválido (UUID no válido).");
  return c;
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail> {
  const raw = await apiFetch<any>(`/customers/${id}`);
  const c = normalizeCustomer(raw);
  if (!c) throw new Error("Customer inválido (UUID no válido).");
  return {
    ...c,
    preferences: raw.preferences || [],
    activities: raw.activities || [],
    sales: raw.sales || [],
  };
}

export async function createCustomer(body: CustomerCreateInput): Promise<Customer> {
  const raw = await apiFetch<any>(`/customers`, {
    method: "POST",
    body: JSON.stringify(sanitize(body))
  });
  const c = normalizeCustomer(raw);
  if (!c) throw new Error("Customer creado pero respuesta inválida.");
  return c;
}

export async function updateCustomer(id: string, body: CustomerUpdateInput): Promise<Customer> {
  const raw = await apiFetch<any>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(sanitize(body))
  });
  const c = normalizeCustomer(raw);
  if (!c) throw new Error("Customer actualizado pero respuesta inválida.");
  return c;
}

export async function deleteCustomer(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/customers/${id}`, { method: "DELETE" });
}

// ── Preferences ──

export async function addCustomerPreference(
  customerId: string,
  data: { brandId?: string; modelId?: string; yearFrom?: number; yearTo?: number; minPrice?: number; maxPrice?: number; notes?: string }
): Promise<CustomerPreference> {
  return apiFetch<CustomerPreference>(`/customers/${customerId}/preferences`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeCustomerPreference(customerId: string, prefId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/customers/${customerId}/preferences/${prefId}`, { method: "DELETE" });
}

export async function toggleCustomerPreference(customerId: string, prefId: string): Promise<{ id: string; isActive: boolean }> {
  return apiFetch<{ id: string; isActive: boolean }>(`/customers/${customerId}/preferences/${prefId}/toggle`, { method: "PATCH" });
}

// ── Activities ──

export async function addCustomerActivity(
  customerId: string,
  data: { type: string; notes?: string }
): Promise<CustomerActivity> {
  return apiFetch<CustomerActivity>(`/customers/${customerId}/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Status ──

export async function updateCustomerStatus(customerId: string, status: string): Promise<{ id: string; status: string }> {
  return apiFetch<{ id: string; status: string }>(`/customers/${customerId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Matching Vehicles ──

export async function getMatchingVehicles(customerId: string): Promise<MatchingVehicle[]> {
  return apiFetch<MatchingVehicle[]>(`/customers/${customerId}/matches`);
}
