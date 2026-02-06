import { apiFetch } from "@/lib/api";

export type LeadStatus = "NEW" | "IN_PROGRESS" | "WON" | "LOST";

export type Lead = {
  id: string;
  storeId?: string;

  status: LeadStatus;
  source?: string | null;

  fullName?: string | null;
  phone?: string | null;
  email?: string | null;

  customerId?: string | null;
  assignedToUserId?: string | null;

  customer?: { id: string; fullName: string; phone?: string | null; email?: string | null } | null;
  assignedTo?: { id: string; fullName?: string | null; email: string } | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type LeadListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LeadListResult = {
  data: Lead[];
  meta: LeadListMeta;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function extractArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input?.results)) return input.results;
  return [];
}

function normalizeLead(raw: any): Lead | null {
  const id = String(raw?.id ?? "").trim();
  if (!UUID_RE.test(id)) return null;

  const status = (raw?.status ?? "NEW") as LeadStatus;

  return {
    id,
    storeId: raw?.storeId ?? raw?.store_id,

    status,
    source: raw?.source ?? null,

    fullName: raw?.fullName ?? raw?.full_name ?? null,
    phone: raw?.phone ?? null,
    email: raw?.email ?? null,

    customerId: raw?.customerId ?? raw?.customer_id ?? null,
    assignedToUserId: raw?.assignedToUserId ?? raw?.assigned_to_user_id ?? null,

    customer: raw?.customer
      ? {
        id: raw.customer.id,
        fullName: raw.customer.fullName ?? raw.customer.full_name ?? "(Sin nombre)",
        phone: raw.customer.phone ?? null,
        email: raw.customer.email ?? null
      }
      : null,

    assignedTo: raw?.assignedTo
      ? {
        id: raw.assignedTo.id,
        fullName: raw.assignedTo.fullName ?? raw.assignedTo.full_name ?? null,
        email: raw.assignedTo.email
      }
      : null,

    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? null
  };
}

function normalizeListResult(input: any): LeadListResult {
  const arr = extractArray(input);
  const data = arr.map(normalizeLead).filter((x): x is Lead => x !== null);

  const meta: LeadListMeta = {
    page: Number(input?.meta?.page ?? 1),
    limit: Number(input?.meta?.limit ?? 20),
    total: Number(input?.meta?.total ?? data.length),
    totalPages: Number(input?.meta?.totalPages ?? 1)
  };

  return { data, meta };
}

export type LeadQuery = {
  page?: number;
  limit?: number;

  q?: string;
  status?: LeadStatus;
  customerId?: string;
  assignedToUserId?: string;

  createdFrom?: string;
  createdTo?: string;

  sortBy?: "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
};

export type LeadCreateInput = {
  status?: LeadStatus | null;
  source?: string | null;

  fullName?: string | null;
  phone?: string | null;
  email?: string | null;

  customerId?: string | null;
  assignedToUserId?: string | null;
};

export type LeadUpdateInput = Partial<LeadCreateInput>;

function sanitize(body: LeadCreateInput | LeadUpdateInput) {
  // ✅ SOLO campos del DTO
  const out: any = {};

  if ((body as any).status !== undefined) out.status = (body as any).status ?? null;
  if ((body as any).source !== undefined) out.source = (body as any).source ?? null;

  if ((body as any).fullName !== undefined) out.fullName = (body as any).fullName ?? null;
  if ((body as any).phone !== undefined) out.phone = (body as any).phone ?? null;
  if ((body as any).email !== undefined) out.email = (body as any).email ?? null;

  if ((body as any).customerId !== undefined) out.customerId = (body as any).customerId ?? null;
  if ((body as any).assignedToUserId !== undefined) out.assignedToUserId = (body as any).assignedToUserId ?? null;

  return out;
}

export async function listLeads(query?: LeadQuery): Promise<LeadListResult> {
  const qs = new URLSearchParams();

  if (query?.page) qs.set("page", String(query.page));
  if (query?.limit) qs.set("limit", String(query.limit));

  if (query?.q?.trim()) qs.set("q", query.q.trim());
  if (query?.status) qs.set("status", query.status);
  if (query?.customerId) qs.set("customerId", query.customerId);
  if (query?.assignedToUserId) qs.set("assignedToUserId", query.assignedToUserId);

  if (query?.createdFrom) qs.set("createdFrom", query.createdFrom);
  if (query?.createdTo) qs.set("createdTo", query.createdTo);

  if (query?.sortBy) qs.set("sortBy", query.sortBy);
  if (query?.sortDir) qs.set("sortDir", query.sortDir);

  const raw = await apiFetch<any>(`/leads${qs.toString() ? `?${qs}` : ""}`);
  return normalizeListResult(raw);
}

export async function getLead(id: string): Promise<Lead> {
  const raw = await apiFetch<any>(`/leads/${id}`);
  const l = normalizeLead(raw);
  if (!l) throw new Error("Lead inválido (UUID no válido).");
  return l;
}

export async function createLead(body: LeadCreateInput): Promise<Lead> {
  const raw = await apiFetch<any>(`/leads`, {
    method: "POST",
    body: JSON.stringify(sanitize(body))
  });
  const l = normalizeLead(raw);
  if (!l) throw new Error("Lead creado pero respuesta inválida.");
  return l;
}

export async function updateLead(id: string, body: LeadUpdateInput): Promise<Lead> {
  const raw = await apiFetch<any>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(sanitize(body))
  });
  const l = normalizeLead(raw);
  if (!l) throw new Error("Lead actualizado pero respuesta inválida.");
  return l;
}

export async function deleteLead(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/leads/${id}`, { method: "DELETE" });
}

// --- Preferences ---

export type LeadPreference = {
  id: string;
  leadId: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;

  desiredBrandId?: string | null;
  desiredModelId?: string | null;
  vehicleTypeId?: string | null;

  notes?: string | null;

  desiredBrand?: { id: string; name: string } | null;
  desiredModel?: { id: string; name: string } | null;
  vehicleType?: { id: string; name: string } | null;
};

export type LeadPreferenceInput = {
  minPrice?: number | null;
  maxPrice?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  desiredBrandId?: string | null;
  desiredModelId?: string | null;
  vehicleTypeId?: string | null;
  notes?: string | null;
};

export async function getLeadPreference(leadId: string): Promise<LeadPreference | null> {
  try {
    const raw = await apiFetch<any>(`/leads/${leadId}/preference`);
    return raw ? raw : null;
  } catch (e: any) {
    if (e.status === 404 || e.message?.includes("NOT_FOUND")) return null;
    throw e;
  }
}

export async function upsertLeadPreference(leadId: string, body: LeadPreferenceInput): Promise<LeadPreference> {
  return apiFetch<LeadPreference>(`/leads/${leadId}/preference`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

