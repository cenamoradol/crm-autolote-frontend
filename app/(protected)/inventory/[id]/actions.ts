"use server";

/**
 * Fuerza el refresco de las fichas de vehiculo en el sitio publico.
 *
 * El sitio cachea cada ficha 1 hora (ISR). Este endpoint invalida ese cache
 * para que un precio corregido se vea de inmediato.
 * El secret solo existe en el servidor: nunca viaja al navegador.
 */
export async function revalidateVehiclePage(): Promise<{ ok: boolean; message: string }> {
    const base = process.env.WEBSITE_URL;
    const secret = process.env.REVALIDATE_SECRET;

    if (!base || !secret) {
        return { ok: false, message: "Falta WEBSITE_URL o REVALIDATE_SECRET en el CRM" };
    }

    try {
        const res = await fetch(`${base.replace(/\/+$/, "")}/api/revalidate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": secret,
            },
            body: JSON.stringify({ publicId: "*" }),
        });

        if (!res.ok) {
            return { ok: false, message: `El sitio respondio ${res.status}` };
        }
        return { ok: true, message: "Fichas actualizadas en el sitio" };
    } catch (e: any) {
        return { ok: false, message: e?.message || "No se pudo contactar al sitio" };
    }
}
