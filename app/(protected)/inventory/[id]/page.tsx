"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { getVehicle, updateVehicle, type Vehicle, type VehicleUpsertPayload } from "@/lib/vehicles";
import VehicleForm from "@/components/inventory/VehicleForm";
import VehicleMediaManager from "@/components/inventory/VehicleMediaManager";
import VehicleReservationCard from "@/components/inventory/VehicleReservationCard";
import VehicleSaleCard from "@/components/inventory/VehicleSaleCard";
import { InlineAlert } from "@/components/ui/InlineAlert";

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

export default function VehicleEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const router = useRouter();
  const sp = useSearchParams();

  // ✅ returnTo manda. backTo legacy.
  const returnTo = useMemo(
    () => safeDecode(sp.get("returnTo")) ?? safeDecode(sp.get("backTo")) ?? "/inventory",
    [sp]
  );

  const [data, setData] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const isArchived = useMemo(() => data?.status === "ARCHIVED", [data]);
  const isSold = useMemo(() => data?.status === "SOLD", [data]);

  // ✅ selfHref: este detalle con su returnTo original (para volver después de activity create/edit/list)
  const selfHref = useMemo(() => {
    const effectiveId = data?.id ?? id;
    return `/inventory/${effectiveId}?returnTo=${encodeURIComponent(returnTo)}`;
  }, [data, id, returnTo]);

  // ✅ Activities links
  const activitiesListHref = useMemo(() => {
    if (!data) return "#";
    return `/activities?vehicleId=${data.id}&returnTo=${encodeURIComponent(selfHref)}`;
  }, [data, selfHref]);

  const createActivityHref = useMemo(() => {
    if (!data) return "#";
    return `/activities/new?vehicleId=${data.id}&returnTo=${encodeURIComponent(selfHref)}`;
  }, [data, selfHref]);

  async function load() {
    setErr(null);
    setOkMsg(null);
    setLoading(true);
    try {
      const v = await getVehicle(id);
      setData(v);
    } catch (e: any) {
      setErr(e?.message || "No se pudo cargar el vehículo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(payload: VehicleUpsertPayload) {
    setErr(null);
    setOkMsg(null);
    setSaving(true);
    try {
      const v = await updateVehicle(id, payload);
      setData(v);
      setOkMsg("Vehículo actualizado.");
    } catch (e: any) {
      setErr(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Sin setVehiclePublished: lo hacemos con updateVehicle
  async function togglePublish(next: boolean) {
    if (isArchived) return;
    setErr(null);
    setOkMsg(null);
    setSaving(true);
    try {
      const v = await updateVehicle(id, { isPublished: next } as any);
      setData(v);
      setOkMsg(next ? "Vehículo publicado." : "Vehículo despublicado.");
    } catch (e: any) {
      setErr(e?.message || "No se pudo cambiar publicación.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Sin archiveVehicle: lo hacemos con updateVehicle status ARCHIVED
  async function archive() {
    if (!confirm("¿Archivar este vehículo?")) return;
    setErr(null);
    setOkMsg(null);
    setSaving(true);
    try {
      await updateVehicle(id, { status: "ARCHIVED" } as any);
      setOkMsg("Vehículo archivado.");
      router.push(returnTo);
    } catch (e: any) {
      setErr(e?.message || "No se pudo archivar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-3 text-muted">Cargando...</div>;

  if (!data) {
    return (
      <div className="p-3">
        {err ? (
          <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />
        ) : (
          <div className="text-muted">Sin datos.</div>
        )}

        <button className="btn btn-outline-secondary mt-3" onClick={() => router.push(returnTo)}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-outline-secondary" onClick={() => router.push(returnTo)}>
          ← Volver
        </button>

        {/* ✅ Botones de Actividades */}
        <Link className="btn btn-outline-success" href={createActivityHref}>
          + Registrar actividad
        </Link>
        <Link className="btn btn-outline-secondary" href={activitiesListHref}>
          Ver actividades
        </Link>

        <div className="ms-auto d-flex gap-2 align-items-center">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!data.isPublished}
              disabled={saving || isArchived}
              onChange={(e) => togglePublish(e.target.checked)}
              id="pubSwitch"
            />
            <label className="form-check-label" htmlFor="pubSwitch">
              Publicado
            </label>
          </div>

          <button className="btn btn-outline-danger" onClick={archive} disabled={saving || isArchived}>
            Archivar
          </button>
        </div>
      </div>

      {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}
      {okMsg ? <InlineAlert type="success" message={okMsg} onClose={() => setOkMsg(null)} /> : null}

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-header fw-semibold">
              Editar vehículo
              {isSold ? <span className="badge text-bg-warning ms-2">SOLD</span> : null}
              {isArchived ? <span className="badge text-bg-secondary ms-2">ARCHIVED</span> : null}
            </div>
            <div className="card-body">
              <VehicleForm initial={data} onSubmit={onSubmit} saving={saving || isArchived} />
              {isArchived ? (
                <div className="alert alert-light border small mt-3 mb-0">
                  Este vehículo está archivado. No se permite editar ni publicar.
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            <VehicleMediaManager vehicleId={data.id} />
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="d-grid gap-3">
            <VehicleReservationCard vehicleId={data.id} />

            <VehicleSaleCard vehicleId={data.id} sale={(data.sale as any) ?? null} onChanged={load} />

            <div className="card">
              <div className="card-header fw-semibold">Info rápida</div>
              <div className="card-body small">
                <div>
                  <b>ID:</b> {data.id}
                </div>
                <div>
                  <b>PublicId:</b> {data.publicId}
                </div>
                <div>
                  <b>Status:</b> {data.status}
                </div>
                <div>
                  <b>Branch:</b> {data.branch?.name ?? (data as any).branchId}
                </div>
                <div>
                  <b>Marca/Modelo:</b> {(data.brand?.name ?? (data as any).brandId)} /{" "}
                  {(data.model?.name ?? (data as any).modelId)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
