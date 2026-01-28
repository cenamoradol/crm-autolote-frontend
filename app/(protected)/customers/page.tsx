"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import CustomerTable from "@/components/customers/CustomerTable";
import { listCustomers, type Customer, type CustomerListMeta } from "@/lib/customers";

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<CustomerListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const canSubmit = useMemo(() => q.trim().length === 0 || q.trim().length >= 2, [q]);
  const effectiveQ = useMemo(() => {
    const t = q.trim();
    return t.length >= 2 ? t : undefined;
  }, [q]);

  async function load(page: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listCustomers({
        page,
        limit: meta.limit,
        q: effectiveQ,
        sortBy: "createdAt",
        sortDir: "desc"
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e.message || "Error cargando customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const onShow = () => load(1);
    window.addEventListener("pageshow", onShow);
    load(1);
    return () => window.removeEventListener("pageshow", onShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilter(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    load(1);
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <div>
            <h5 className="mb-0">Customers</h5>
            <small className="text-muted">
              Total: {meta.total} · Página {meta.page}/{meta.totalPages}
            </small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => load(meta.page)} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>
            <Link className="btn btn-primary" href="/customers/new">
              + Crear customer
            </Link>
          </div>
        </div>

        {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

        <form className="row g-2 align-items-end mb-3" onSubmit={onFilter}>
          <div className="col-12 col-md-9">
            <label className="form-label">Buscar</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, teléfono o email (mín 2 chars)"
            />
          </div>

          <div className="col-12 col-md-3 d-flex gap-2">
            <button className={`btn btn-outline-primary w-100 ${!canSubmit ? "disabled" : ""}`} type="submit">
              Filtrar
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setQ("");
                load(1);
              }}
            >
              Limpiar
            </button>
          </div>
        </form>

        <CustomerTable items={items} />

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
