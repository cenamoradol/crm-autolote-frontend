"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { InlineAlert } from "@/components/ui/InlineAlert";
import { deleteVehicle, listVehicles, type Vehicle, type VehicleStatus } from "@/lib/vehicles";

function money(v: any) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InventoryPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(sp.get("status") ?? "");
  const [published, setPublished] = useState<string>(sp.get("published") ?? "");

  const returnTo = useMemo(() => `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, [pathname, sp]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const data = await listVehicles({
        status: (status as VehicleStatus) || undefined,
        published: published === "true" ? "true" : published === "false" ? "false" : undefined
      });
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Error cargando inventario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setStatus(sp.get("status") ?? "");
    setPublished(sp.get("published") ?? "");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();

    const qs = new URLSearchParams(sp.toString());

    if (status) qs.set("status", status);
    else qs.delete("status");

    if (published === "true" || published === "false") qs.set("published", published);
    else qs.delete("published");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    load();
  }

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("status");
    qs.delete("published");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    setStatus("");
    setPublished("");
    load();
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <div>
            <h5 className="mb-0">Inventario</h5>
            <small className="text-muted">Total: {items.length}</small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => load()} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>

            <Link className="btn btn-primary" href={`/inventory/new?returnTo=${encodeURIComponent(returnTo)}`}>
              + Crear vehículo
            </Link>
          </div>
        </div>

        {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

        <form className="row g-2 align-items-end mb-3" onSubmit={applyFilters}>
          <div className="col-12 col-md-5">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">(Todos)</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="SOLD">SOLD</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label">Publicado</label>
            <select className="form-select" value={published} onChange={(e) => setPublished(e.target.value)}>
              <option value="">(Todos)</option>
              <option value="true">Solo publicados</option>
              <option value="false">Solo NO publicados</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex gap-2">
            <button className="btn btn-outline-primary w-100" type="submit">
              Filtrar
            </button>
            <button className="btn btn-outline-secondary w-100" type="button" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </form>

        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Brand/Model</th>
                <th>Año</th>
                <th>Precio</th>
                <th>Status</th>
                <th>Publicado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className="fw-semibold">
                    {v.title ?? v.publicId ?? "(Sin título)"}{" "}
                    {v.publicId ? <span className="text-muted small">· {v.publicId}</span> : null}
                  </td>
                  <td className="text-muted">
                    {(v.brand?.name ?? "-") + " / " + (v.model?.name ?? "-")}
                  </td>
                  <td className="text-muted">{v.year ?? "-"}</td>
                  <td className="text-muted">{money(v.price)}</td>
                  <td>{v.status ? <span className="badge text-bg-secondary">{v.status}</span> : "-"}</td>
                  <td>{v.isPublished ? <span className="badge text-bg-success">Sí</span> : <span className="badge text-bg-light">No</span>}</td>

                  <td className="text-end d-flex justify-content-end gap-2">
                    <Link className="btn btn-outline-primary btn-sm" href={`/inventory/${v.id}?returnTo=${encodeURIComponent(returnTo)}`}>
                      Editar
                    </Link>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                      onClick={async () => {
                        if (!confirm("¿Archivar este vehículo? (DELETE en backend lo pasa a ARCHIVED)")) return;
                        try {
                          await deleteVehicle(v.id);
                          await load();
                        } catch (e: any) {
                          setErr(e?.message || "No se pudo archivar");
                        }
                      }}
                    >
                      Archivar
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">
                    Sin vehículos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
