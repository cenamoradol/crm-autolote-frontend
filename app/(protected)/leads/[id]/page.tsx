"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import LeadForm from "@/components/leads/LeadForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { deleteLead, getLead, updateLead, type Lead } from "@/lib/leads";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    // ✅ evita open redirect tipo //evil.com
    if (!d.startsWith("/") || d.startsWith("//")) return null;
    return d;
  } catch {
    return null;
  }
}

export default function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : params) as {
    id: string;
  };
  const id = resolved.id;

  const sp = useSearchParams();

  // ✅ de dónde venimos (listado de leads u otra vista)
  const returnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? "/leads", [sp]);

  const [data, setData] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const l = await getLead(id);
      setData(l);
    } catch (e: any) {
      setErr(e?.message || "Error cargando lead");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!UUID_RE.test(id)) {
      setErr(`ID inválido en URL: "${id}"`);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ selfHref: este detalle (con su returnTo original)
  const selfHref = useMemo(() => {
    const effectiveId = data?.id ?? id;
    return `/leads/${effectiveId}?returnTo=${encodeURIComponent(returnTo)}`;
  }, [data, id, returnTo]);

  // ✅ /activities filtrado por lead y con "Volver" al lead detalle
  const activitiesListHref = useMemo(() => {
    if (!data) return "#";
    return `/activities?leadId=${data.id}&returnTo=${encodeURIComponent(selfHref)}`;
  }, [data, selfHref]);

  // ✅ /activities/new con leadId preset y al guardar/cancelar vuelve al lead detalle
  const createActivityHref = useMemo(() => {
    if (!data) return "#";
    return `/activities/new?leadId=${data.id}&returnTo=${encodeURIComponent(selfHref)}`;
  }, [data, selfHref]);

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
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-success" href={createActivityHref}>
            + Registrar actividad
          </Link>

          <Link className="btn btn-outline-secondary" href={activitiesListHref}>
            Ver actividades
          </Link>

          <a className="btn btn-outline-secondary" href={returnTo}>
            ← Volver
          </a>
        </div>

        <button
          className="btn btn-outline-danger"
          type="button"
          onClick={async () => {
            if (!confirm("¿Eliminar este lead?")) return;
            try {
              await deleteLead(id);
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
        <LeadForm
          mode="edit"
          initial={data}
          submitLabel="Guardar"
          backHref={returnTo}
          onSubmit={async (payload) => {
            try {
              const updated = await updateLead(id, payload);
              setData(updated);
              setOk("Guardado ✅");
            } catch (e: any) {
              setErr(e?.message || "No se pudo guardar");
            }
          }}
        />
      </div>
    </div>
  );
}
