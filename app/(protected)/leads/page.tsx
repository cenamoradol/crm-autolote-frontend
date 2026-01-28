"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { InlineAlert } from "@/components/ui/InlineAlert";
import LeadTable from "@/components/leads/LeadTable";
import { listLeads, type Lead, type LeadListMeta, type LeadStatus } from "@/lib/leads";

export default function LeadsPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const [items, setItems] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filtros desde querystring (persisten al refrescar)
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");

  const canFilter = useMemo(() => q.trim().length === 0 || q.trim().length >= 2, [q]);

  async function load(page: number) {
    setLoading(true);
    setErr(null);

    try {
      const res = await listLeads({
        page,
        limit: meta.limit,
        q: q.trim().length >= 2 ? q.trim() : undefined,
        status: (status || undefined) as LeadStatus | undefined,
        sortBy: "createdAt",
        sortDir: "desc"
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e?.message || "Error cargando leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // cuando cambia la URL, sincronizamos estado local y recargamos
    setQ(sp.get("q") ?? "");
    setStatus(sp.get("status") ?? "");
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    if (!canFilter) return;

    const qs = new URLSearchParams(sp.toString());

    if (q.trim().length >= 2) qs.set("q", q.trim());
    else qs.delete("q");

    if (status) qs.set("status", status);
    else qs.delete("status");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);
    load(1);
  }

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("q");
    qs.delete("status");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    setQ("");
    setStatus("");
    load(1);
  }

  const returnTo = useMemo(() => `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, [pathname, sp]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <div>
            <h5 className="mb-0">Leads</h5>
            <small className="text-muted">
              Total: {meta.total} · Página {meta.page}/{meta.totalPages}
            </small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => load(meta.page)} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>

            <Link className="btn btn-primary" href={`/leads/new?returnTo=${encodeURIComponent(returnTo)}`}>
              + Crear lead
            </Link>
          </div>
        </div>

        {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

        <form className="row g-2 align-items-end mb-3" onSubmit={applyFilters}>
          <div className="col-12 col-md-8">
            <label className="form-label">Buscar</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, teléfono, email o source (mín 2 chars)"
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">(Todos)</option>
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className={`btn btn-outline-primary ${!canFilter ? "disabled" : ""}`} type="submit">
              Filtrar
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </form>

        <LeadTable items={items} />

        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary"
            disabled={loading || meta.page <= 1}
            onClick={() => load(meta.page - 1)}
            type="button"
          >
            ← Anterior
          </button>

          <small className="text-muted">
            Página {meta.page} de {meta.totalPages}
          </small>

          <button
            className="btn btn-outline-secondary"
            disabled={loading || meta.page >= meta.totalPages}
            onClick={() => load(meta.page + 1)}
            type="button"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
