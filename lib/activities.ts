import { apiFetch } from "@/lib/api";

export type ActivityType = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";

export type Activity = {
  id: string;
  type: ActivityType;
  notes?: string | null;

  leadId?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;

  createdAt?: string | null;

  // opcional si el backend lo incluye
  lead?: { id: string; fullName?: string | null; phone?: string | null; email?: string | null } | null;
  customer?: { id: string; fullName?: string | null; phone?: string | null; email?: string | null } | null;
  vehicle?: { id: string; title?: string | null; publicId?: string | null; year?: number | null } | null;
};

export type ActivityListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ActivityListResult = {
  data: Activity[];
  meta: ActivityListMeta;
};

export type ActivityQuery = {
  page?: number;
  limit?: number;

  q?: string;
  type?: ActivityType;

  leadId?: string;
  customerId?: string;
  vehicleId?: string;

  createdFrom?: string;
  createdTo?: string;

  sortBy?: "createdAt";
  sortDir?: "asc" | "desc";
};

export type ActivityCreateInput = {
  type: ActivityType;
  notes?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
};

export type ActivityUpdateInput = Partial<ActivityCreateInput>;

function extractArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input?.results)) return input.results;
  return [];
}

function normalizeOne(raw: any): Activity {
  return {
    id: raw?.id,
    type: raw?.type,
    notes: raw?.notes ?? null,

    leadId: raw?.leadId ?? raw?.lead_id ?? null,
    customerId: raw?.customerId ?? raw?.customer_id ?? null,
    vehicleId: raw?.vehicleId ?? raw?.vehicle_id ?? null,

    createdAt: raw?.createdAt ?? raw?.created_at ?? null,

    lead: raw?.lead ?? null,
    customer: raw?.customer ?? null,
    vehicle: raw?.vehicle ?? null
  };
}

function normalizeList(raw: any): ActivityListResult {
  const data = extractArray(raw).map(normalizeOne);
  return {
    data,
    meta: {
      page: Number(raw?.meta?.page ?? 1),
      limit: Number(raw?.meta?.limit ?? 20),
      total: Number(raw?.meta?.total ?? data.length),
      totalPages: Number(raw?.meta?.totalPages ?? 1)
    }
  };
}

function sanitize(body: ActivityCreateInput | ActivityUpdateInput) {
  // ✅ SOLO campos DTO
  const out: any = {};

  if ((body as any).type !== undefined) out.type = (body as any).type;
  if ((body as any).notes !== undefined) out.notes = (body as any).notes ?? null;

  if ((body as any).leadId !== undefined) out.leadId = (body as any).leadId ?? null;
  if ((body as any).customerId !== undefined) out.customerId = (body as any).customerId ?? null;
  if ((body as any).vehicleId !== undefined) out.vehicleId = (body as any).vehicleId ?? null;

  return out;
}

export async function listActivities(query: ActivityQuery): Promise<ActivityListResult> {
  const qs = new URLSearchParams();

  if (query.page) qs.set("page", String(query.page));
  if (query.limit) qs.set("limit", String(query.limit));

  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.type) qs.set("type", query.type);

  if (query.leadId) qs.set("leadId", query.leadId);
  if (query.customerId) qs.set("customerId", query.customerId);
  if (query.vehicleId) qs.set("vehicleId", query.vehicleId);

  if (query.createdFrom) qs.set("createdFrom", query.createdFrom);
  if (query.createdTo) qs.set("createdTo", query.createdTo);

  if (query.sortBy) qs.set("sortBy", query.sortBy);
  if (query.sortDir) qs.set("sortDir", query.sortDir);

  const raw = await apiFetch<any>(`/activities?${qs.toString()}`);
  return normalizeList(raw);
}

export async function getActivity(id: string): Promise<Activity> {
  const raw = await apiFetch<any>(`/activities/${id}`);
  return normalizeOne(raw);
}

export async function createActivity(body: ActivityCreateInput): Promise<Activity> {
  const raw = await apiFetch<any>(`/activities`, {
    method: "POST",
    body: JSON.stringify(sanitize(body))
  });
  return normalizeOne(raw);
}

export async function updateActivity(id: string, body: ActivityUpdateInput): Promise<Activity> {
  const raw = await apiFetch<any>(`/activities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(sanitize(body))
  });
  return normalizeOne(raw);
}

export async function deleteActivity(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/activities/${id}`, { method: "DELETE" });
}
