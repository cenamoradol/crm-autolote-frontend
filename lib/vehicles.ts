import { apiFetch } from "@/lib/api";

/** Backend enums */
export type VehicleStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "ARCHIVED";

/** UI/back compat payload name */
export type VehicleUpsertPayload = {
  branchId: string;
  brandId: string;
  modelId: string;
  vehicleTypeId?: string;

  title?: string;
  description?: string;
  year?: number;
  price?: string | number | null;
  mileage?: number;
  vin?: string;
  stockNumber?: string; // existe en prisma, backend aún no lo setea en service
  color?: string;
  transmission?: string;
  fuelType?: string;

  isPublished?: boolean;
};

export type Brand = { id: string; name: string };
export type Model = { id: string; name: string; brandId?: string; brand?: Brand };
export type Branch = { id: string; name: string; address?: string | null; isPrimary?: boolean };

export type VehicleMedia = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  isCover?: boolean;
  position?: number;
};

export type Vehicle = {
  id: string;
  storeId: string;
  branchId: string;
  publicId: string;

  status: VehicleStatus;
  isPublished: boolean;

  brandId: string;
  modelId: string;
  vehicleTypeId?: string | null;

  title?: string | null;
  description?: string | null;
  year?: number | null;
  price?: string | number | null; // Prisma Decimal suele venir como string
  mileage?: number | null;
  vin?: string | null;
  stockNumber?: string | null;
  color?: string | null;
  transmission?: string | null;
  fuelType?: string | null;

  createdAt?: string;
  updatedAt?: string;

  brand?: Brand;
  model?: Model;
  vehicleType?: { id: string; name: string };
  branch?: Branch;
  media?: VehicleMedia[];

  reservation?: any;
  sale?: any;
};

function buildQuery(params: Record<string, any>) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    s.set(k, String(v));
  });
  const q = s.toString();
  return q ? `?${q}` : "";
}

/** LIST */
export async function listVehicles(opts?: { status?: VehicleStatus; published?: boolean; search?: string }) {
  const q = buildQuery({
    status: opts?.status,
    published: typeof opts?.published === "boolean" ? String(opts.published) : undefined,
    search: opts?.search,
  });
  return apiFetch<Vehicle[]>(`/vehicles${q}`, { method: "GET" });
}

/** GET */
export async function getVehicle(id: string) {
  return apiFetch<Vehicle>(`/vehicles/${encodeURIComponent(id)}`, { method: "GET" });
}

/** CREATE */
export async function createVehicle(payload: VehicleUpsertPayload) {
  const body: any = {
    branchId: payload.branchId,
    brandId: payload.brandId,
    modelId: payload.modelId,
    vehicleTypeId: payload.vehicleTypeId ?? undefined,
    title: payload.title ?? undefined,
    description: payload.description ?? undefined,
    year: payload.year ?? undefined,
    price: payload.price ?? undefined,
    mileage: payload.mileage ?? undefined,
    vin: payload.vin ?? undefined,
    color: payload.color ?? undefined,
    transmission: payload.transmission ?? undefined,
    fuelType: payload.fuelType ?? undefined,
    isPublished: typeof payload.isPublished === "boolean" ? payload.isPublished : undefined,
    // stockNumber: (backend actual no lo usa; NO lo mandamos para no provocar 400)
  };

  return apiFetch<Vehicle>(`/vehicles`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** UPDATE */
export async function updateVehicle(id: string, payload: Partial<VehicleUpsertPayload>) {
  const body: any = {
    branchId: payload.branchId ?? undefined,
    brandId: payload.brandId ?? undefined,
    modelId: payload.modelId ?? undefined,
    vehicleTypeId: payload.vehicleTypeId ?? undefined,
    title: payload.title ?? undefined,
    description: payload.description ?? undefined,
    year: payload.year ?? undefined,
    price: payload.price ?? undefined,
    mileage: payload.mileage ?? undefined,
    vin: payload.vin ?? undefined,
    color: payload.color ?? undefined,
    transmission: payload.transmission ?? undefined,
    fuelType: payload.fuelType ?? undefined,
    isPublished: typeof payload.isPublished === "boolean" ? payload.isPublished : undefined,
    // stockNumber: (backend actual no lo usa; NO lo mandamos)
  };

  return apiFetch<Vehicle>(`/vehicles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}


/**
 * DELETE en backend = ARCHIVE (status=ARCHIVED)
 * Dejamos deleteVehicle + archiveVehicle como alias.
 */
export async function deleteVehicle(id: string) {
  return apiFetch<Vehicle>(`/vehicles/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export async function archiveVehicle(id: string) {
  return deleteVehicle(id);
}

/** Publish/unpublish */
export async function setVehiclePublish(id: string, isPublished: boolean) {
  return apiFetch<Vehicle>(`/vehicles/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ isPublished }),
  });
}
// alias con el nombre que tu page.tsx está importando:
export async function setVehiclePublished(id: string, isPublished: boolean) {
  return setVehiclePublish(id, isPublished);
}
