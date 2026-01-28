"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import ActivityForm from "@/components/activities/ActivityForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { deleteActivity, getActivity, updateActivity, type Activity } from "@/lib/activities";

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    if (!d.startsWith("/") || d.startsWith("//")) return null;
    return d;
  } catch {
    return null;
  }
}

export default function ActivityEditPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : params) as {
    id: string;
  };
  const id = resolved.id;

  const sp = useSearchParams();

  // ✅ returnTo manda, backTo legacy
  const explicitReturnTo = useMemo(
    () => safeDecode(sp.get("returnTo")) ?? safeDecode(sp.get("backTo")),
    [sp]
  );

  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ✅ returnTo final:
  // 1) si viene por query, úsalo
  // 2) si no viene, y ya cargó la actividad, regresa a /activities filtrado por su contexto
  // 3) fallback final: /activities
  const returnTo = useMemo(() => {
    if (explicitReturnTo) return explicitReturnTo;

    if (data) {
      const qs = new URLSearchParams();
      if (data.leadId) qs.set("leadId", data.leadId);
      if (data.customerId) qs.set("customerId", data.customerId);
      if (data.vehicleId) qs.set("vehicleId", data.vehicleId);
      const suffix = qs.toString();
      return `/activities${suffix ? `?${suffix}` : ""}`;
    }

    return "/activities";
  }, [explicitReturnTo, data]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const a = await getActivity(id);
      setData(a);
    } catch (e: any) {
      setErr(e?.message || "Error cargando actividad");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !data) return <div className="alert alert-info">Cargando...</div>;

  if (!data) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          {err ? (
            <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />
          ) : (
            <div className="text-muted">No encontrado</div>
          )}
          <a className="btn btn-outline-secondary mt-2" href={returnTo}>
            Volver
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {(ok || err) && (
        <div className="col-12">
          <InlineAlert
            type={err ? "danger" : "success"}
            message={err ?? ok ?? ""}
            onClose={() => {
              setOk(null);
              setErr(null);
            }}
          />
        </div>
      )}

      <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <a className="btn btn-outline-secondary" href={returnTo}>
          ← Volver
        </a>

        <button
          className="btn btn-outline-danger"
          type="button"
          onClick={async () => {
            if (!confirm("¿Eliminar esta actividad?")) return;
            try {
              await deleteActivity(id);
              window.location.href = returnTo;
            } catch (e: any) {
              setErr(e?.message || "No se pudo eliminar");
            }
          }}
        >
          Eliminar
        </button>
      </div>

      <div className="col-12">
        <ActivityForm
          mode="edit"
          initial={data}
          submitLabel="Guardar"
          backHref={returnTo}
          onSubmit={async (payload) => {
            try {
              const updated = await updateActivity(id, payload);
              setData(updated);
              setOk("Guardado ✅");
              window.location.href = returnTo;
            } catch (e: any) {
              setErr(e?.message || "No se pudo guardar");
            }
          }}
        />
      </div>
    </div>
  );
}
