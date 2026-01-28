import { apiFetch } from "@/lib/api";

export type Brand = { id: string; name: string };
export type Model = { id: string; name: string; brandId: string };

export async function listBrands(q?: string): Promise<Brand[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  return apiFetch<Brand[]>(`/brands${qs.toString() ? `?${qs}` : ""}`);
}

export async function listModelsByBrand(brandId: string, q?: string): Promise<Model[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  return apiFetch<Model[]>(`/brands/${brandId}/models${qs.toString() ? `?${qs}` : ""}`);
}
