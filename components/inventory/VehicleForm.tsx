"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

// ✅ Usa el tipo ÚNICO del lib (evita mismatch con inventory/[id]/page.tsx)
import type { VehicleUpsertPayload } from "@/lib/vehicles";

type Branch = {
  id: string;
  name: string;
  address?: string | null;
  isPrimary?: boolean;
};

type Brand = {
  id: string;
  name: string;
};

type Model = {
  id: string;
  name: string;
  brandId?: string;
};

type Props = {
  // ✅ puede venir Vehicle completo u otros campos; solo usamos los que aplican
  initial?: Partial<VehicleUpsertPayload> & { id?: string };
  submitLabel?: string;
  onSubmit: (payload: VehicleUpsertPayload) => Promise<void> | void;
  onCancel?: () => void;
  // (opcional) si en otros lugares quieres deshabilitar el form externamente
  saving?: boolean;
};

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });

  // Evita el error "Unexpected token '<'" cuando llega HTML
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Respuesta no es JSON. (${res.status}) Verifica ruta: ${url}`);
  }

  if (!res.ok) {
    const msg =
      (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
      data?.error ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ✅ En el tipo del lib normalmente se usa undefined (no null)
function toIntOrUndefined(v: string): number | undefined {
  const s = (v ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function toStringOrUndefined(v: string): string | undefined {
  const s = (v ?? "").trim();
  return s ? s : undefined;
}

function toPriceOrUndefined(v: string): string | number | undefined {
  const s = (v ?? "").trim();
  return s ? s : undefined; // backend acepta string/number para Decimal
}

export default function VehicleForm({
  initial,
  submitLabel = "Guardar",
  onSubmit,
  onCancel,
  saving: savingExternal
}: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savingFinal = !!savingExternal || saving;

  // --- Form state (strings para inputs) ---
  const [branchId, setBranchId] = useState(initial?.branchId ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [modelId, setModelId] = useState(initial?.modelId ?? "");

  // ✅ title en lib suele ser string | undefined (no null)
  const [title, setTitle] = useState((initial?.title ?? "") as string);

  const [description, setDescription] = useState((initial?.description ?? "") as string);

  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");

  const [price, setPrice] = useState(() => {
    const p: any = (initial as any)?.price;
    return p === null || p === undefined ? "" : String(p);
  });

  const [mileage, setMileage] = useState(initial?.mileage ? String(initial.mileage) : "");
  const [vin, setVin] = useState((initial?.vin ?? "") as string);
  const [color, setColor] = useState((initial?.color ?? "") as string);
  const [transmission, setTransmission] = useState((initial?.transmission ?? "") as string);
  const [fuelType, setFuelType] = useState((initial?.fuelType ?? "") as string);
  const [isPublished, setIsPublished] = useState(!!initial?.isPublished);

  const canLoadModels = useMemo(() => !!brandId, [brandId]);

  // Cargar catálogos iniciales (✅ usa /api/bff/... porque tu proxy está en app/api/bff/[...path]/route.ts)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCatalogs(true);
      setError(null);

      try {
        const [b1, b2] = await Promise.all([fetchJson("/api/bff/branches"), fetchJson("/api/bff/brands")]);

        if (!alive) return;

        // soporta respuestas tipo array o {data:[]}
        const branchesArr: Branch[] = Array.isArray(b1) ? b1 : b1?.data ?? [];
        const brandsArr: Brand[] = Array.isArray(b2) ? b2 : b2?.data ?? [];

        setBranches(branchesArr);
        setBrands(brandsArr);

        // defaults
        if (!branchId && branchesArr.length) setBranchId(branchesArr[0].id);
        if (!brandId && brandsArr.length) setBrandId(brandsArr[0].id);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error cargando catálogos.");
      } finally {
        if (!alive) return;
        setLoadingCatalogs(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!canLoadModels) {
        setModels([]);
        setModelId("");
        return;
      }

      setLoadingModels(true);
      setError(null);

      try {
        const res = await fetchJson(`/api/bff/models?brandId=${encodeURIComponent(brandId)}`);
        if (!alive) return;

        const modelsArr: Model[] = Array.isArray(res) ? res : res?.data ?? [];
        setModels(modelsArr);

        // si el modelId actual no existe para la marca nueva -> set al primero
        const exists = modelsArr.some((m) => m.id === modelId);
        if (!exists) setModelId(modelsArr[0]?.id ?? "");
      } catch (e: any) {
        if (!alive) return;
        setModels([]);
        setModelId("");
        setError(e?.message ?? "Error cargando modelos.");
      } finally {
        if (!alive) return;
        setLoadingModels(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brandId, canLoadModels]); // modelId intencionalmente fuera para evitar loops

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!branchId) return setError("Selecciona un Branch.");
    if (!brandId) return setError("Selecciona una Marca.");
    if (!modelId) return setError("Selecciona un Modelo.");

    const payload: VehicleUpsertPayload = {
      branchId,
      brandId,
      modelId,

      // ✅ usamos undefined en lugar de null (para compatibilidad de tipos)
      title: toStringOrUndefined(title),
      description: toStringOrUndefined(description),
      year: toIntOrUndefined(year),
      mileage: toIntOrUndefined(mileage),
      vin: toStringOrUndefined(vin),
      color: toStringOrUndefined(color),
      transmission: toStringOrUndefined(transmission),
      fuelType: toStringOrUndefined(fuelType),

      // backend acepta string/number para Decimal
      price: toPriceOrUndefined(price),

      isPublished
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message ?? "Error guardando vehículo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">Vehículo</h5>

        {/* ✅ InlineAlert con tu API real: type + message */}
        {error && (
          <div className="mb-3">
            <InlineAlert type="danger" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {loadingCatalogs ? (
          <InlineAlert type="info" message="Cargando catálogos..." />
        ) : (
          <>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Branch</label>
                <select className="form-select" value={branchId} onChange={(e) => setBranchId(e.target.value)} disabled={savingFinal}>
                  <option value="">Seleccione...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Marca</label>
                <select className="form-select" value={brandId} onChange={(e) => setBrandId(e.target.value)} disabled={savingFinal}>
                  <option value="">Seleccione...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Modelo</label>
                <select
                  className="form-select"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  disabled={!brandId || loadingModels || savingFinal}
                >
                  <option value="">
                    {loadingModels ? "Cargando..." : brandId ? "Seleccione..." : "Seleccione marca primero"}
                  </option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Toyota Corolla 2018"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Precio</label>
                <input
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 12500.00"
                  inputMode="decimal"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción corta..."
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Año</label>
                <input
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej: 2018"
                  inputMode="numeric"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Mileage</label>
                <input
                  className="form-control"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="Ej: 65000"
                  inputMode="numeric"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">VIN</label>
                <input
                  className="form-control"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="VIN (opcional)"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Color</label>
                <input
                  className="form-control"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej: Blanco"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Transmisión</label>
                <input
                  className="form-control"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="Ej: Automática"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Tipo de combustible</label>
                <input
                  className="form-control"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  placeholder="Ej: Gasolina"
                  disabled={savingFinal}
                />
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input
                    id="isPublished"
                    className="form-check-input"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    disabled={savingFinal}
                  />
                  <label className="form-check-label" htmlFor="isPublished">
                    Publicado
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <LoadingButton className="btn btn-primary" type="submit" loading={savingFinal}>
                {submitLabel}
              </LoadingButton>

              {onCancel && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={savingFinal}>
                  Cancelar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
