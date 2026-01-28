"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { getSaleFromList, money, type Sale } from "@/lib/sales";

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/sales";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const s = await getSaleFromList(id);
      if (!s) {
        setSale(null);
        setErr("Venta no encontrada (no existe en el listado actual).");
        return;
      }
      setSale(s);
    } catch (e: any) {
      setErr(e?.message || "No se pudo cargar el detalle");
      setSale(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const vehicleLabel = useMemo(() => {
    if (!sale?.vehicle) return sale?.vehicleId ?? "-";
    return (
      sale.vehicle.title ??
      [sale.vehicle.brand?.name, sale.vehicle.model?.name, sale.vehicle.year ? String(sale.vehicle.year) : ""]
        .filter(Boolean)
        .join(" ") ??
      sale.vehicle.publicId ??
      sale.vehicle.id
    );
  }, [sale]);

  if (loading) return <div className="container py-3 text-muted">Cargando...</div>;

  if (!sale) {
    return (
      <div className="container py-3">
        {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}
        <button className="btn btn-outline-secondary mt-3" onClick={() => router.push(returnTo)}>
          ← Volver
        </button>
      </div>
    );
  }

  const seller = sale.soldBy?.fullName || sale.soldBy?.email || sale.soldByUserId;
  const customerOrLead = sale.customer?.fullName || sale.lead?.fullName || "-";

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-outline-secondary" onClick={() => router.push(returnTo)}>
          ← Volver
        </button>
        <h5 className="mb-0">Detalle de venta</h5>
      </div>

      {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}

      <div className="card shadow-sm">
        <div className="card-header fw-semibold">Resumen</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Fecha</div>
              <div className="fw-semibold">{new Date(sale.soldAt).toLocaleString()}</div>
            </div>

            <div className="col-12 col-md-6">
              <div className="text-muted small">Precio vendido</div>
              <div className="fw-semibold">{money(sale.soldPrice)}</div>
            </div>

            <div className="col-12 col-md-6">
              <div className="text-muted small">Vehículo</div>
              <div className="fw-semibold">{vehicleLabel}</div>
              <div className="text-muted small">{sale.vehicle?.publicId ? `ID público: ${sale.vehicle.publicId}` : ""}</div>

              <div className="mt-2 d-flex gap-2 flex-wrap">
                <Link className="btn btn-sm btn-outline-primary" href={`/inventory/${sale.vehicleId}?returnTo=/sales`}>
                  Ver vehículo
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="text-muted small">Vendedor</div>
              <div className="fw-semibold">{seller}</div>

              <div className="mt-3 text-muted small">Cliente / Lead</div>
              <div className="fw-semibold">{customerOrLead}</div>
              <div className="text-muted small">
                {[sale.customer?.phone, sale.customer?.email, sale.lead?.phone, sale.lead?.email]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>

            {sale.notes ? (
              <div className="col-12">
                <div className="text-muted small">Notas</div>
                <div>{sale.notes}</div>
              </div>
            ) : (
              <div className="col-12 text-muted small">Sin notas.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
