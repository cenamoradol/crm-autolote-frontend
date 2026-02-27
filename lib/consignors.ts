import { apiFetch } from "@/lib/api";

export type Consignor = {
    id: string;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    dni?: string | null;
    rtn?: string | null;
    notes?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    vehicles?: any[];
};

export type ConsignorCreateInput = {
    fullName: string;
    phone?: string | null;
    email?: string | null;
    dni?: string | null;
    rtn?: string | null;
    notes?: string | null;
};

export type ConsignorUpdateInput = Partial<ConsignorCreateInput>;

export async function listConsignors(q?: string): Promise<Consignor[]> {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return apiFetch<Consignor[]>(`/consignors${qs}`);
}

export async function getConsignor(id: string): Promise<Consignor> {
    return apiFetch<Consignor>(`/consignors/${id}`);
}

export async function createConsignor(body: ConsignorCreateInput): Promise<Consignor> {
    return apiFetch<Consignor>(`/consignors`, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export async function updateConsignor(id: string, body: ConsignorUpdateInput): Promise<Consignor> {
    return apiFetch<Consignor>(`/consignors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

export async function deleteConsignor(id: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/consignors/${id}`, { method: "DELETE" });
}
