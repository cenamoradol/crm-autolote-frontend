import { apiFetch } from "./api";

export type Brand = {
    id: string;
    name: string;
};

export type Model = {
    id: string;
    name: string;
    brandId: string;
};

export async function listBrands(q?: string) {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    return apiFetch<Brand[]>(`/brands${query}`);
}

export async function createBrand(name: string) {
    return apiFetch<Brand>("/brands", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export async function updateBrand(id: string, name: string) {
    return apiFetch<Brand>(`/brands/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
}

export async function deleteBrand(id: string) {
    return apiFetch<{ ok: boolean }>(`/brands/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

export async function listModels(brandId: string, q?: string) {
    const query = q ? `&q=${encodeURIComponent(q)}` : "";
    return apiFetch<Model[]>(`/models?brandId=${encodeURIComponent(brandId)}${query}`);
}

export async function createModel(brandId: string, name: string) {
    return apiFetch<Model>(`/brands/${encodeURIComponent(brandId)}/models`, {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export async function updateModel(id: string, name: string, brandId?: string) {
    return apiFetch<Model>(`/models/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ name, brandId }),
    });
}

export async function deleteModel(id: string) {
    return apiFetch<{ ok: boolean }>(`/models/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}
