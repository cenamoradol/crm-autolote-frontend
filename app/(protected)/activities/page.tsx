"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { InlineAlert } from "@/components/ui/InlineAlert";
import ActivityTable from "@/components/activities/ActivityTable";
import { listActivities, type Activity, type ActivityListMeta } from "@/lib/activities";

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    // evita open redirect tipo //evil.com
    if (!d.startsWith("/") || d.startsWith("//")) return null;
    return d;
  } catch {
    return null;
  }
}

export default function ActivitiesPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const leadId = sp.get("leadId") ?? "";
  const customerId = sp.get("customerId") ?? "";
  const vehicleId = sp.get("vehicleId") ?? "";

  // ✅ backTo/returnTo padre (Lead/Customer/Vehicle). Solo mostramos si NO es /activities
  const backTo = useMemo(() => {
    const rt = safeDecode(sp.get("returnTo"));
    if (rt && !rt.startsWith("/activities")) return rt;

    const bt = safeDecode(sp.get("backTo"));
    if (bt && !bt.startsWith("/activities")) return bt;

    return null;
  }, [sp]);

  // ✅ URL exacta del listado actual (incluye filtros + contexto + returnTo)
  const listUrl = useMemo(() => {
    const qs = sp.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sp]);

  // ✅ Create: vuelve a ESTE listado exacto (con filtros + contexto + returnTo)
  const createHref = useMemo(() => {
    const qs = new URLSearchParams(sp.toString());
    qs.set("returnTo", listUrl);
    return `/activities/new?${qs.toString()}`;
  }, [sp, listUrl]);

  const [items, setItems] = useState<Activity[]>([]);
  const [meta, setMeta] = useState<ActivityListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [createdFrom, setCreatedFrom] = useState(sp.get("createdFrom") ?? "");
  const [createdTo, setCreatedTo] = useState(sp.get("createdTo") ?? "");

  const canFilter = useMemo(() => q.trim().length === 0 || q.trim().length >= 2, [q]);

  async function load(page: number) {
    setLoading(true);
    setErr(null);

    try {
      // ✅ Permitimos listado global si no hay contexto
      const res = await listActivities({
        page,
        limit: meta.limit,
        q: q.trim().length >= 2 ? q.trim() : undefined,
        type: type || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        leadId: leadId || undefined,
        customerId: customerId || undefined,
        vehicleId: vehicleId || undefined,
        sortBy: "createdAt",
        sortDir: "desc"
      });

      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e?.message || "Error cargando actividades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setType(sp.get("type") ?? "");
    setCreatedFrom(sp.get("createdFrom") ?? "");
    setCreatedTo(sp.get("createdTo") ?? "");

    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    if (!canFilter) return;

    const qs = new URLSearchParams(sp.toString());

    if (q.trim().length >= 2) qs.set("q", q.trim());
    else qs.delete("q");

    if (type) qs.set("type", type);
    else qs.delete("type");

    if (createdFrom) qs.set("createdFrom", createdFrom);
    else qs.delete("createdFrom");

    if (createdTo) qs.set("createdTo", createdTo);
    else qs.delete("createdTo");

    // ✅ NO borrar returnTo/backTo (mantiene navegación)
    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);
    load(1);
  }

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("q");
    qs.delete("type");
    qs.delete("createdFrom");
    qs.delete("createdTo");

    // ✅ NO borrar returnTo/backTo (mantiene navegación)
    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    setQ("");
    setType("");
    setCreatedFrom("");
    setCreatedTo("");

    load(1);
  }

  const contextLabel = useMemo(() => {
    if (leadId) return "Filtrado por Lead";
    if (customerId) return "Filtrado por Customer";
    if (vehicleId) return "Filtrado por Vehicle";
    return "Global";
  }, [leadId, customerId, vehicleId]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <div>
            <h5 className="mb-0">Activities</h5>
            <small className="text-muted">
              {contextLabel} · Total: {meta.total} · Página {meta.page}/{meta.totalPages}
            </small>
          </div>

          <div className="d-flex gap-2">
            {backTo && (
              <a className="btn btn-outline-secondary" href={backTo}>
                ← Volver
              </a>
            )}

            <button className="btn btn-outline-secondary" onClick={() => load(meta.page)} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>

            <Link className="btn btn-primary" href={createHref}>
              + Registrar actividad
            </Link>
          </div>
        </div>

        {err && <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />}

        <form className="row g-2 align-items-end mb-3" onSubmit={applyFilters}>
          <div className="col-12 col-md-5">
            <label className="form-label">Buscar</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Notas / texto (mín 2 chars)"
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">(Todos)</option>
              <option value="CALL">CALL</option>
              <option value="WHATSAPP">WHATSAPP</option>
              <option value="EMAIL">EMAIL</option>
              <option value="MEETING">MEETING</option>
              <option value="NOTE">NOTE</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-control" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} />
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

        <ActivityTable items={items} />

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
