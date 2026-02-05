"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createVehicle, type VehicleUpsertPayload } from "@/lib/vehicles";

// --- Types ---
type Branch = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

type Model = {
  id: string;
  name: string;
};

// --- Helpers ---
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

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

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

function toPriceOrUndefined(v: string): string | undefined {
  const s = (v ?? "").trim();
  return s ? s : undefined;
}

// --- Icons (Inline SVGs) ---
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" />
      <path d="M8 10h.01" /><path d="M16 10h.01" />
      <path d="M8 14h.01" /><path d="M16 14h.01" />
      <path d="M8 18h.01" /><path d="M16 18h.01" />
    </svg>
  );
}

function IconFileText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function IconSave({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}


export default function VehicleCreatePage() {
  const sp = useSearchParams();
  const returnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? "/inventory", [sp]);

  // --- Global Component State ---
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Catalogs ---
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // --- Form Data ---
  const [branchId, setBranchId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [mileage, setMileage] = useState("");
  const [vin, setVin] = useState("");

  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");

  const [isPublished, setIsPublished] = useState(false);

  // --- Validation ---
  const [vinError, setVinError] = useState<string | null>(null);

  const canLoadModels = useMemo(() => !!brandId, [brandId]);

  // 1. Initial Load: Branches & Brands
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCatalogs(true);
      try {
        const [b1, b2] = await Promise.all([
          fetchJson("/api/bff/branches"),
          fetchJson("/api/bff/brands")
        ]);
        if (!alive) return;

        const branchesArr = Array.isArray(b1) ? b1 : b1?.data ?? [];
        const brandsArr = Array.isArray(b2) ? b2 : b2?.data ?? [];

        setBranches(branchesArr);
        setBrands(brandsArr);

        // Pre-select if only one option or similar logic if desired? 
        // Logic from original:
        if (branchesArr.length > 0) setBranchId(branchesArr[0].id);
        if (brandsArr.length > 0) setBrandId(brandsArr[0].id);

      } catch (e: any) {
        if (alive) setError(e.message ?? "Error loading catalogs");
      } finally {
        if (alive) setLoadingCatalogs(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2. Load Models when Brand changes
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!brandId) {
        setModels([]);
        setModelId("");
        return;
      }
      setLoadingModels(true);
      try {
        const res = await fetchJson(`/api/bff/models?brandId=${encodeURIComponent(brandId)}`);
        if (!alive) return;
        const modelsArr = Array.isArray(res) ? res : res?.data ?? [];
        setModels(modelsArr);

        // Reset model if current selection not valid
        if (!modelsArr.some((m: any) => m.id === modelId)) {
          setModelId(modelsArr[0]?.id ?? "");
        }
      } catch (e: any) {
        if (alive) setError(e.message ?? "Error loading models");
      } finally {
        if (alive) setLoadingModels(false);
      }
    })();
    return () => { alive = false; };
  }, [brandId]);

  // --- Handlers ---

  async function handleSubmit() {
    setError(null);
    setVinError(null);

    // Basic required checks
    if (!branchId) return setError("Selecciona una sucursal.");
    if (!brandId) return setError("Selecciona una marca.");
    if (!modelId) return setError("Selecciona un modelo.");
    if (!price) return setError("Ingresa un precio.");

    // Simple VIN validation simulation (could be real logic)
    if (vin && vin.length < 5) {
      setVinError("El VIN debe tener al menos 5 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const payload: VehicleUpsertPayload = {
        branchId,
        brandId,
        modelId,
        title: toStringOrUndefined(title),
        description: undefined, // Not in new design, maybe ignore or add later
        year: toIntOrUndefined(year),
        mileage: toIntOrUndefined(mileage),
        vin: toStringOrUndefined(vin),
        color: toStringOrUndefined(color),
        transmission: toStringOrUndefined(transmission),
        fuelType: toStringOrUndefined(fuelType),
        price: toPriceOrUndefined(price),
        isPublished,
      };

      const created = await createVehicle(payload);
      // Redirect
      window.location.href = `/inventory/${created.id}?returnTo=${encodeURIComponent(returnTo)}`;
    } catch (e: any) {
      setError(e?.message ?? "Error guardando vehículo.");
      setSaving(false);
    }
  }

  // --- Render ---

  // Common input classes
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border";
  const selectClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white";
  const sectionClass = "bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <IconHome className="w-4 h-4" /> Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/inventory" className="hover:text-blue-600">Inventario</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Nuevo Vehículo</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Vehículo</h1>
            <Link
              href={returnTo}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-medium"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <IconInfo className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Vehículo guardado temporalmente</h3>
            <p className="text-sm text-blue-700 mt-1">
              Los cambios se han sincronizado con el borrador local automáticamente.
            </p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Cerrar
          </button>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loadingCatalogs ? (
          <div className="text-center py-12 text-gray-500">Cargando formulario...</div>
        ) : (
          <>
            {/* Section 1: Datos Base */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconBuilding className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Datos Base</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Sucursal</label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={branchId}
                      onChange={e => setBranchId(e.target.value)}
                    >
                      <option value="">Seleccionar Sucursal</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Marca</label>
                  <select
                    className={selectClass}
                    value={brandId}
                    onChange={e => setBrandId(e.target.value)}
                  >
                    <option value="">Seleccionar Marca</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Modelo</label>
                  <select
                    className={selectClass}
                    value={modelId}
                    onChange={e => setModelId(e.target.value)}
                    disabled={!brandId || loadingModels}
                  >
                    <option value="">
                      {loadingModels ? "Cargando..." : "Seleccionar Modelo"}
                    </option>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Detalles del Vehículo */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconFileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Detalles del Vehículo</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>Título del anuncio</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ej: Toyota Corolla 2022 - Impecable"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      className={`${inputClass} pl-7`}
                      placeholder="0.00"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Año</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={year}
                    onChange={e => setYear(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kilometraje</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={`${inputClass} pr-10`}
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">km</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>VIN (Número de Chasis)</label>
                  <input
                    type="text"
                    className={`${inputClass} ${vinError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    placeholder="1A2B3C..."
                    value={vin}
                    onChange={e => setVin(e.target.value)}
                  />
                  {vinError && (
                    <p className="text-red-500 text-xs mt-1">{vinError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Características Técnicas */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconSettings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Características Técnicas</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Color Exterior</label>
                  {/* Using a simple select for now as per design mockup showing dropdowns likely, or inputs */}
                  {/* Mockup shows "Blanco" in a dropdown-like box, I will use Select for premium feel if I had options, but I'll use input behaving like others or a select with presets + custom? 
                             The `VehicleForm` used string input. I'll stick to input for data entry flexibility unless I hardcode common colors. 
                             Wait, the mockup specifically shows a dropdown arrow. I should probably make it a select with common options + 'Other'.
                             Actually, let's keep it as an input styled nicely, or a select effectively.
                             For the sake of "Functiona con lo que tenemos", VehicleForm was input.
                             But mockup shows dropdown. I'll make it a select with some defaults.
                         */}
                  <select
                    className={selectClass}
                    value={color}
                    onChange={e => setColor(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Blanco">Blanco</option>
                    <option value="Negro">Negro</option>
                    <option value="Gris">Gris</option>
                    <option value="Plata">Plata</option>
                    <option value="Azul">Azul</option>
                    <option value="Rojo">Rojo</option>
                    {/* Fallback for existing data if it was something else? new page so no existing data */}
                    {color && !["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo"].includes(color) && <option value={color}>{color}</option>}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Transmisión</label>
                  <select
                    className={selectClass}
                    value={transmission}
                    onChange={e => setTransmission(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Combustible</label>
                  <select
                    className={selectClass}
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className={sectionClass + " w-full md:w-auto mb-0 border-0 shadow-none p-0 bg-transparent"}>
                {/* Reusing section styling logic? No, jus plain */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <IconGlobe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Publicado en la web</h4>
                    <p className="text-xs text-gray-500">Si se activa, el vehículo será visible en el catálogo público.</p>
                  </div>
                  <button
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isPublished ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => window.location.href = returnTo}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : (
                    <>
                      <IconSave className="w-4 h-4" />
                      Crear Vehículo
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
