import { apiFetch } from "./api";

export interface Advertisement {
    id: string;
    title: string | null;
    kind: "IMAGE" | "VIDEO";
    imageUrl: string;
    targetUrl: string | null;
    placement: "HERO" | "VEHICLE_LIST" | "FLOATING_BOTTOM";
    isActive: boolean;
    position: number;
    createdAt: string;
}

export async function listAdvertisements(): Promise<Advertisement[]> {
    return apiFetch("/advertisements");
}

export async function createAdvertisement(data: FormData): Promise<Advertisement> {
    return apiFetch("/advertisements/upload", {
        method: "POST",
        body: data,
    });
}

export async function updateAdvertisement(id: string, data: FormData): Promise<Advertisement> {
    return apiFetch(`/advertisements/${id}/upload`, {
        method: "PATCH",
        body: data,
    });
}

export async function deleteAdvertisement(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/advertisements/${id}`, {
        method: "DELETE",
    });
}
