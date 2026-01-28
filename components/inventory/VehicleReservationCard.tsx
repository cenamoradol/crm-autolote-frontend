"use client";

import { useEffect, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { getReservationByVehicle, type Reservation } from "@/lib/reservations";

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function VehicleReservationCard({ vehicleId }: { vehicleId: string }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const r = await getReservationByVehicle(vehicleId);
      setReservation(r);
    } catch (e: any) {
      setErr(e?.message || "Error cargando la reserva del vehículo.");
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!vehicleId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  return (
    <div className="card mt-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="mb-1">Reserva</h5>
            <div className="text-muted small">
              {loading ? "Cargando..." : reservation ? "Reserva activa" : "Sin reserva activa"}
            </div>
          </div>

          <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
            Recargar
          </button>
        </div>

        {err && (
          <div className="mt-3">
            <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />
          </div>
        )}

        {!loading && !err && !reservation && (
          <div className="mt-3 text-muted">Este vehículo no tiene ninguna reserva activa.</div>
        )}

        {!loading && !err && reservation && (
          <div className="mt-3">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <div className="small text-muted">Reservado el</div>
                <div>{fmtDate(reservation.reservedAt)}</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="small text-muted">Expira</div>
                <div>{fmtDate(reservation.expiresAt)}</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="small text-muted">Cliente</div>
                <div>{reservation.customer?.fullName || "-"}</div>
                {reservation.customer?.phone && <div className="text-muted small">{reservation.customer.phone}</div>}
              </div>

              <div className="col-12 col-md-6">
                <div className="small text-muted">Lead</div>
                <div>{reservation.lead?.fullName || "-"}</div>
                {reservation.lead?.phone && <div className="text-muted small">{reservation.lead.phone}</div>}
              </div>

              <div className="col-12">
                <div className="small text-muted">Notas</div>
                <div>{reservation.notes || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
