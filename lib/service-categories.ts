import { apiFetch } from "./api";

export type ServiceCategory = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export async function listServiceCategories() {
  return apiFetch<ServiceCategory[]>("/service-categories");
}

export async function createServiceCategory(name: string) {
  return apiFetch<ServiceCategory>("/service-categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateServiceCategory(id: string, name: string) {
  return apiFetch<ServiceCategory>(`/service-categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteServiceCategory(id: string) {
  return apiFetch<{ ok: boolean }>(`/service-categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
