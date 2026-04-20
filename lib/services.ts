import { apiFetch } from "@/lib/api";

export type ServiceMedia = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  isCover?: boolean;
  position?: number;
};

export type ServiceListing = {
  id: string;
  storeId: string;
  categoryId?: string | null;
  name: string;
  serviceType: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  media?: ServiceMedia[];
  category?: { id: string; name: string; slug: string };
};

export type ServiceListingPayload = {
  name: string;
  serviceType: string;
  categoryId?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  isPublished?: boolean;
};

export async function listServices() {
  return apiFetch<ServiceListing[]>(`/services`, { method: "GET" });
}

export async function getService(id: string) {
  return apiFetch<ServiceListing>(`/services/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createService(payload: ServiceListingPayload) {
  return apiFetch<ServiceListing>(`/services`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateService(id: string, payload: Partial<ServiceListingPayload>) {
  return apiFetch<ServiceListing>(`/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteService(id: string) {
  return apiFetch<{ ok: boolean }>(`/services/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function setServicePublished(id: string, isPublished: boolean) {
  return apiFetch<ServiceListing>(`/services/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ isPublished }),
  });
}

// Media
export async function uploadServiceMedia(id: string, file: File) {
  const data = new FormData();
  data.append("file", file);
  return apiFetch<ServiceMedia>(`/services/${encodeURIComponent(id)}/media/upload`, {
    method: "POST",
    body: data,
  });
}

export async function uploadManyServiceMedia(id: string, files: File[]) {
  const data = new FormData();
  files.forEach((f) => data.append("files", f));
  return apiFetch<ServiceMedia[]>(`/services/${encodeURIComponent(id)}/media/upload-many`, {
    method: "POST",
    body: data,
  });
}

export async function removeServiceMedia(id: string, mediaId: string) {
  return apiFetch<{ ok: boolean }>(`/services/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`, {
    method: "DELETE",
  });
}
