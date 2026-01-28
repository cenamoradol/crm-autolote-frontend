"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  applySalesFilters,
  fetchAllSales,
  groupBySeller,
  money,
  summarizeSales,
  type Sale,
} from "@/lib/sales";

type Option = { value: string; label: string };

export default function SalesPage() {
  const [all, setAll] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filtros
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [sellerId, setSellerId] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // paginación frontend
  const [page, setPage] = useState(1);
  const pageSize = 20;

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchAllSales();
      setAll(data);
    } catch (e: any) {
      setErr(e?.message || "No se pudo cargar ventas");
      setAll([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // opciones derivadas del JSON (sin backend)
  const brandOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const b = s.vehicle?.brand;
      if (b?.id && b?.name) map.set(b.id, b.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const modelOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const m = s.vehicle?.model;
      const b = s.vehicle?.brand;
      if (!m?.id || !m?.name) continue;
      if (brandId && b?.id !== brandId) continue;
      map.set(m.id, m.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [all, brandId]);

  const sellerOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const id = s.soldByUserId;
      const label = s.soldBy?.fullName || s.soldBy?.email || id;
      map.set(id, label);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const filtered = useMemo(() => {
    return applySalesFilters(all, {
      from: from || undefined,
      to: to || undefined,
      brandId: brandId || undefined,
      modelId: modelId || undefined,
      sellerId: sellerId || undefined,
      q: q || undefined,
    });
  }, [all, from, to, brandId, modelId, sellerId, q]);

  const summary = useMemo(() => summarizeSales(filtered), [filtered]);

  const sellerSummary = useMemo(() => groupBySeller(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  // si cambian filtros, volver a página 1
  useEffect(() => {
    setPage(1);
  }, [from, to, brandId, modelId, sellerId, q]);

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h4 className="mb-0">Ventas</h4>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
            {loading ? "Actualizando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label">Desde</label>
              <input
                className="form-control"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Hasta</label>
              <input
                className="form-control"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Marca</label>
              <select
                className="form-select"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setModelId(""); // reset modelo si cambia marca
                }}
                disabled={loading}
              >
                <option value="">Todas</option>
                {brandOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Modelo</label>
              <select
                className="form-select"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                disabled={loading}
              >
                <option value="">Todos</option>
                {modelOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Vendedor</label>
              <select
                className="form-select"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                disabled={loading}
              >
                <option value="">Todos</option>
                {sellerOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="form-text">* Lista derivada del GET /sales (sin tocar backend).</div>
            </div>

            <div className="col-12 col-md-8">
              <label className="form-label">Buscar</label>
              <input
                className="form-control"
                placeholder="Ej: Honda, Civic, -O8deFcE6q, nombre cliente, vendedor, notas..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <div className="d-flex gap-3 flex-wrap">
                <div className="card border-0 bg-light">
                  <div className="card-body py-2">
                    <div className="text-muted small">Total de ventas</div>
                    <div className="fw-semibold fs-5">{summary.totalSales}</div>
                  </div>
                </div>

                <div className="card border-0 bg-light">
                  <div className="card-body py-2">
                    <div className="text-muted small">Monto total vendido</div>
                    <div className="fw-semibold fs-5">{money(summary.totalAmount)}</div>
                  </div>
                </div>

                <div className="ms-auto text-muted small d-flex align-items-center">
                  Página {pageSafe}/{totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen por vendedor */}
      <div className="card shadow-sm mb-3">
        <div className="card-header fw-semibold">Resumen por vendedor</div>
        <div className="table-responsive">
          <table className="table table-sm mb-0 align-middle">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th className="text-end"># Ventas</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {sellerSummary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-muted p-3">
                    Sin datos.
                  </td>
                </tr>
              ) : (
                sellerSummary.map((r) => (
                  <tr key={r.sellerId}>
                    <td>{r.sellerName}</td>
                    <td className="text-end">{r.count}</td>
                    <td className="text-end">{money(r.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla */}
      <div className="card shadow-sm">
        <div className="card-header fw-semibold">Listado</div>

        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Precio vendido</th>
                <th>Vendedor</th>
                <th>Cliente/Lead</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted p-3">
                    Cargando...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted p-3">
                    No hay ventas con los filtros actuales.
                  </td>
                </tr>
              ) : (
                pageRows.map((s) => {
                  const veh =
                    s.vehicle?.title ??
                    [s.vehicle?.brand?.name, s.vehicle?.model?.name, s.vehicle?.year ? String(s.vehicle.year) : ""]
                      .filter(Boolean)
                      .join(" ") ??
                    s.vehicle?.publicId ??
                    s.vehicleId;

                  const who = s.soldBy?.fullName || s.soldBy?.email || s.soldByUserId;
                  const who2 = s.customer?.fullName || s.lead?.fullName || "-";

                  return (
                    <tr key={s.id}>
                      <td>{new Date(s.soldAt).toLocaleString()}</td>
                      <td>
                        <div className="fw-semibold">{veh}</div>
                        <div className="text-muted small">
                          {s.vehicle?.publicId ? `ID público: ${s.vehicle.publicId}` : ""}
                        </div>
                      </td>
                      <td className="fw-semibold">{money(s.soldPrice)}</td>
                      <td>{who}</td>
                      <td>{who2}</td>
                      <td className="text-end">
                        <Link className="btn btn-sm btn-outline-primary" href={`/sales/${s.id}?returnTo=/sales`}>
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="card-body d-flex justify-content-between">
          <button
            className="btn btn-outline-secondary"
            disabled={loading || pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>

          <button
            className="btn btn-outline-secondary"
            disabled={loading || pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
