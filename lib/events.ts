import { apiFetch } from "@/lib/api";
import { Vehicle } from "./vehicles";

export type EventCategory = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { events: number };
};

export type EventMedia = {
  id: string;
  eventId: string;
  kind: "IMAGE" | "VIDEO";
  fileKey: string;
  url: string;
  position: number;
  isCover: boolean;
  createdAt: string;
};

export type EventVehicle = {
  id: string;
  eventId: string;
  vehicleId: string;
  position: number;
  createdAt: string;
  vehicle?: Vehicle;
};

export type Event = {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  isPublished: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  category?: EventCategory;
  media?: EventMedia[];
  vehicles?: EventVehicle[];
  _count?: { media: number; vehicles: number };
};

// --- API CATEGORIES ---

export async function getEventCategories() {
  return apiFetch<EventCategory[]>("/event-categories", { method: "GET" });
}

export async function createEventCategory(payload: { name: string; description?: string; position?: number; isActive?: boolean }) {
  return apiFetch<EventCategory>("/event-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEventCategory(id: string, payload: { name?: string; description?: string; position?: number; isActive?: boolean }) {
  return apiFetch<EventCategory>(`/event-categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEventCategory(id: string) {
  return apiFetch<{ ok: boolean }>(`/event-categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// --- API EVENTS ---

export async function getEvents(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  return apiFetch<Event[]>(`/events${query}`, { method: "GET" });
}

export async function getEventById(id: string) {
  return apiFetch<Event>(`/events/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createEvent(payload: { categoryId: string; name: string; description?: string; date?: string; isPublished?: boolean; position?: number }) {
  return apiFetch<Event>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(id: string, payload: { categoryId?: string; name?: string; description?: string; date?: string; isPublished?: boolean; position?: number }) {
  return apiFetch<Event>(`/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function publishEvent(id: string, isPublished: boolean) {
  return apiFetch<Event>(`/events/${encodeURIComponent(id)}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ isPublished }),
  });
}

export async function deleteEvent(id: string) {
  return apiFetch<{ ok: boolean }>(`/events/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// --- API EVENT VEHICLES ---

export async function addEventVehicles(eventId: string, vehicleIds: string[]) {
  return apiFetch<{ ok: boolean; count: number; data: EventVehicle[] }>(`/events/${encodeURIComponent(eventId)}/vehicles`, {
    method: "POST",
    body: JSON.stringify({ vehicleIds }),
  });
}

export async function removeEventVehicle(eventId: string, vehicleId: string) {
  return apiFetch<{ ok: boolean }>(`/events/${encodeURIComponent(eventId)}/vehicles/${encodeURIComponent(vehicleId)}`, { method: "DELETE" });
}

// --- API EVENT MEDIA ---

export async function getEventMedia(eventId: string) {
  const data = await apiFetch<{ data: EventMedia[] }>(`/events/${encodeURIComponent(eventId)}/media`, { method: "GET" });
  return data.data;
}

export async function uploadEventMediaMany(eventId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`/api/bff/events/${encodeURIComponent(eventId)}/media/upload-many`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json() as Promise<{ ok: boolean; count: number; data: EventMedia[] }>;
}

export async function reorderEventMedia(eventId: string, orderedIds: string[]) {
  return apiFetch<{ ok: boolean; data: EventMedia[] }>(`/events/${encodeURIComponent(eventId)}/media/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

export async function setEventMediaCover(eventId: string, mediaId: string) {
  return apiFetch<{ ok: boolean }>(`/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}/cover`, {
    method: "PATCH",
  });
}

export async function deleteEventMedia(eventId: string, mediaId: string) {
  return apiFetch<{ ok: boolean }>(`/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}`, {
    method: "DELETE",
  });
}
