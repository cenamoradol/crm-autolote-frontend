"use client";

import { use, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type StoreDetail = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  logoUrl: string | null;
  domains?: { id: string; domain: string; isPrimary: boolean }[];
  branches?: { id: string; name: string; address: string | null; isPrimary: boolean }[];
  members?: {
    userId: string;
    email: string;
    fullName: string | null;
    roles: { key: string; name: string }[];
  }[];
};

export default function StoreDetailPage({
  params
}: {
  params: Promise<{ storeId: string }> | { storeId: string };
}) {
  // ✅ Next 16/Turbopack: params puede venir como Promise
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ storeId: string }>) : params) as {
    storeId: string;
  };

  const storeId = resolved.storeId;

  const [data, setData] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [supporting, setSupporting] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiFetch<StoreDetail>(`/sa/stores/${storeId}`);
      setData(d);
    } catch (e: any) {
      setErr(e.message || "Error cargando store");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const primaryDomain = useMemo(() => {
    const d = data?.domains?.find((x) => x.isPrimary);
    return d?.domain ?? null;
  }, [data]);

  async function enterSupportMode() {
    setSupporting(true);
    setErr(null);
    try {
      const r = await fetch("/api/support/select-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId })
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "No se pudo seleccionar store");
      }

      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setSupporting(false);
    }
  }

  if (loading && !data) {
    return <div className="alert alert-info">Cargando...</div>;
  }

  if (!data) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          {err ? (
            <InlineAlert message={err} onClose={() => setErr(null)} />
          ) : (
            <div className="text-muted">Sin datos</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="mb-1">{data.name}</h5>
              <div className="text-muted">
                Slug: <code>{data.slug}</code> · Estado:{" "}
                <span className={`badge ${data.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                  {data.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              {primaryDomain && (
                <div className="text-muted">
                  Dominio primario: <code>{primaryDomain}</code>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
                {loading ? "Refrescando..." : "Refrescar"}
              </button>
              <LoadingButton loading={supporting} className="btn btn-primary" onClick={enterSupportMode}>
                Entrar en modo soporte
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="col-12">
          <InlineAlert message={err} onClose={() => setErr(null)} />
        </div>
      )}

      <div className="col-12 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="mb-3">Dominios</h6>
            <ul className="list-group">
              {(data.domains ?? []).map((d) => (
                <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <code>{d.domain}</code>
                  {d.isPrimary ? <span className="badge text-bg-primary">Primario</span> : null}
                </li>
              ))}
              {(data.domains ?? []).length === 0 && <li className="list-group-item text-muted">Sin dominios</li>}
            </ul>
            <small className="text-muted d-block mt-2">(Luego añadimos UI para agregar dominios/editar primario.)</small>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="mb-3">Sucursales (Branches)</h6>
            <ul className="list-group">
              {(data.branches ?? []).map((b) => (
                <li key={b.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">{b.name}</div>
                    {b.isPrimary && <span className="badge text-bg-primary">Principal</span>}
                  </div>
                  {b.address && <small className="text-muted">{b.address}</small>}
                </li>
              ))}
              {(data.branches ?? []).length === 0 && <li className="list-group-item text-muted">Sin sucursales</li>}
            </ul>
            <small className="text-muted d-block mt-2">(Luego añadimos UI para crear/editar branches.)</small>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="mb-3">Miembros</h6>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.members ?? []).map((m) => (
                    <tr key={m.userId}>
                      <td className="fw-semibold">{m.email}</td>
                      <td>{m.fullName ?? "-"}</td>
                      <td>
                        {(m.roles ?? []).map((r) => (
                          <span key={r.key} className="badge text-bg-secondary me-1">
                            {r.key}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                  {(data.members ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Sin miembros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <small className="text-muted">
              Para asignar usuarios, usa la pantalla <b>SA → Users</b> (Assign to Store).
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
