"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

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

export type VehicleUpsertPayload = {
  branchId: string;
  brandId: string;
  modelId: string;

  title?: string | null;
  description?: string | null;
  year?: number | null;
  price?: string | number | null; // backend acepta string/number para Decimal
  mileage?: number | null;
  vin?: string | null;
  color?: string | null;
  transmission?: string | null;
  fuelType?: string | null;

  isPublished?: boolean;
};

type Props = {
  initial?: Partial<VehicleUpsertPayload>;
  submitLabel?: string;
  onSubmit: (payload: VehicleUpsertPayload) => Promise<void> | void;
  onCancel?: () => void;
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

function toIntOrNull(v: string) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toStringOrNull(v: string) {
  const s = (v ?? "").trim();
  return s ? s : null;
}

export default function VehicleForm({ initial, submitLabel = "Guardar", onSubmit, onCancel }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Form state (strings para inputs) ---
  const [branchId, setBranchId] = useState(initial?.branchId ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [modelId, setModelId] = useState(initial?.modelId ?? "");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [price, setPrice] = useState(
    initial?.price === null || initial?.price === undefined ? "" : String(initial.price),
  );
  const [mileage, setMileage] = useState(initial?.mileage ? String(initial.mileage) : "");
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [transmission, setTransmission] = useState(initial?.transmission ?? "");
  const [fuelType, setFuelType] = useState(initial?.fuelType ?? "");
  const [isPublished, setIsPublished] = useState(!!initial?.isPublished);

  const canLoadModels = useMemo(() => !!brandId, [brandId]);

  // Cargar catálogos iniciales (✅ usa /api/bff/... porque tu proxy está en app/api/bff/[...path]/route.ts)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCatalogs(true);
      setError(null);

      try {
        const [b1, b2] = await Promise.all([
          fetchJson("/api/bff/branches"),
          fetchJson("/api/bff/brands"),
        ]);

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
      title: toStringOrNull(title),
      description: toStringOrNull(description),
      year: toIntOrNull(year),
      mileage: toIntOrNull(mileage),
      vin: toStringOrNull(vin),
      color: toStringOrNull(color),
      transmission: toStringOrNull(transmission),
      fuelType: toStringOrNull(fuelType),
      // price: backend lo maneja como Decimal si viene value (string/number)
      price: price.trim() ? price.trim() : null,
      isPublished,
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

        {error && (
          <div className="mb-3">
            <InlineAlert variant="danger">{error}</InlineAlert>
          </div>
        )}

        {loadingCatalogs ? (
          <InlineAlert variant="info">Cargando catálogos...</InlineAlert>
        ) : (
          <>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Branch</label>
                <select
                  className="form-select"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
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
                <select
                  className="form-select"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
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
                  disabled={!brandId || loadingModels}
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
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">VIN</label>
                <input
                  className="form-control"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="VIN (opcional)"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Color</label>
                <input
                  className="form-control"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej: Blanco"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Transmisión</label>
                <input
                  className="form-control"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="Ej: Automática"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Tipo de combustible</label>
                <input
                  className="form-control"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  placeholder="Ej: Gasolina"
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
                  />
                  <label className="form-check-label" htmlFor="isPublished">
                    Publicado
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <LoadingButton className="btn btn-primary" type="submit" loading={saving}>
                {submitLabel}
              </LoadingButton>

              {onCancel && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
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
