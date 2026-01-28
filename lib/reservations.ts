// lib/reservations.ts
export type Reservation = {
  id: string;
  storeId: string;
  vehicleId: string;

  reservedByUserId?: string | null;
  customerId?: string | null;
  leadId?: string | null;

  reservedAt: string;
  expiresAt?: string | null;
  notes?: string | null;

  reservedBy?: { id: string; fullName?: string | null; email?: string | null } | null;
  customer?: { id: string; fullName: string; phone?: string | null; email?: string | null } | null;
  lead?: { id: string; fullName?: string | null; phone?: string | null; email?: string | null } | null;
};

function normalizeReservation(json: any): Reservation | null {
  if (!json) return null;
  if (json.data && typeof json.data === "object") return json.data as Reservation; // {data:{...}}
  if (json.id) return json as Reservation; // {...}
  return null;
}

// ✅ usa tu endpoint REAL: /vehicles/:vehicleId/reservation
export async function getReservationByVehicle(vehicleId: string): Promise<Reservation | null> {
  const res = await fetch(`/api/bff/vehicles/${vehicleId}/reservation`, {
    method: "GET",
    cache: "no-store",
  });

  // ✅ si tu servicio devuelve 404 cuando no hay reserva, lo tratamos como "no hay"
  if (res.status === 404) return null;

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`No se pudo cargar reserva. (${res.status}) ${t}`);
  }

  const json = await res.json().catch(() => null);
  return normalizeReservation(json);
}
