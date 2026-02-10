"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getVehicle, updateVehicle, type Vehicle, type VehicleUpsertPayload } from "@/lib/vehicles";
import { getReservationByVehicle, type Reservation } from "@/lib/reservations";
import { useUser } from "@/components/providers/UserProvider";

// --- Icons ---
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
function IconSave({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}
function IconArchive({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
function IconDollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function IconUpload({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
function IconTrash({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

// --- Helpers ---
function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    if (!d.startsWith("/") || d.startsWith("//")) return null; // Simple open redirect protection
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
function toIntOrUndefined(v: string | number | undefined): number | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}
function toStringOrUndefined(v: string | null | undefined): string | undefined {
  const s = (v ?? "").trim();
  return s ? s : undefined;
}

// --- Components ---

// Simple Search Select (Tailwind version)
function SearchSelectTW({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = "Buscar..."
}: {
  label?: string;
  value: { value: string; label: string; sublabel?: string } | null;
  onChange: (v: any) => void;
  loadOptions: (q: string) => Promise<any[]>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value?.label ?? "");
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInput(value?.label ?? ""); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      if (input.trim().length < 2) { setOptions([]); return; }
      setLoading(true);
      try {
        const res = await loadOptions(input);
        setOptions(res);
      } catch {
        setOptions([]); // silent error
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [input, open, loadOptions]);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => { onChange(null); setInput(""); setOptions([]); }}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      {open && input.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {loading && <div className="px-4 py-2 text-sm text-gray-500">Buscando...</div>}
          {!loading && options.length === 0 && <div className="px-4 py-2 text-sm text-gray-500">Sin resultados</div>}
          {!loading && options.map((opt) => (
            <div
              key={opt.value}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
              onClick={() => { onChange(opt); setInput(opt.label); setOpen(false); }}
            >
              <span className="block truncate font-medium">{opt.label}</span>
              {opt.sublabel && <span className="block truncate text-xs text-gray-500">{opt.sublabel}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sidebars
function ReservationCard({ vehicleId, status }: { vehicleId: string; status: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    getReservationByVehicle(vehicleId)
      .then(setReservation)
      .catch(() => setReservation(null))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <IconCalendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Reservación</h3>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Estado actual</span>
        {reservation ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            RESERVADO
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            DISPONIBLE
          </span>
        )}
      </div>

      {!reservation && (
        <button
          className="w-full bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          onClick={() => alert("Funcionalidad de crear reserva pendiente de modal.")}
        >
          Crear Reservación
        </button>
      )}

      {reservation && (
        <div className="text-sm border-t border-gray-100 pt-3 mt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Cliente:</span>
            <span className="font-medium text-gray-900">{reservation.customer?.fullName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vence:</span>
            <span className="font-medium text-gray-900">{reservation.expiresAt ? new Date(reservation.expiresAt).toLocaleDateString() : "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SaleCard({ vehicleId, sale, onSaleRecorded }: { vehicleId: string; sale: any; onSaleRecorded: () => void }) {
  const user = useUser();
  const [mode, setMode] = useState<"view" | "create">("view");
  const [loading, setLoading] = useState(false);

  // Form state
  const [customer, setCustomer] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [soldPrice, setSoldPrice] = useState("");
  const [notes, setNotes] = useState("");

  const isSold = !!sale;
  const canManageSales = user.isSuperAdmin || user.roles.includes("admin") || user.roles.includes("supervisor");

  async function handleSale() {
    if (!soldPrice) return alert("Precio es requerido");
    setLoading(true);
    try {
      const res = await fetch("/api/bff/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          customerId: customer?.value,
          soldByUserId: seller?.value,
          soldPrice: soldPrice.replace(/[^0-9]/g, ""),
          notes
        })
      });
      if (!res.ok) throw new Error("Error al vender");
      onSaleRecorded();
      setMode("view");
    } catch (e) {
      alert("No se pudo registrar la venta");
    } finally {
      setLoading(false);
    }
  }

  if (isSold) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <IconDollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Venta Registrada</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Precio Venta:</span>
            <span className="font-bold text-gray-900">{sale.soldPrice || "-"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Vendido por:</span>
            <span className="text-gray-900 font-medium">{sale.soldBy?.fullName || sale.soldBy?.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span className="text-gray-900">{new Date(sale.soldAt).toLocaleDateString()}</span>
          </div>
          {sale.customer && (
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="text-gray-900">{sale.customer.fullName}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!canManageSales) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <IconDollarSign className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Proceso de Venta</h3>
      </div>

      {mode === "view" ? (
        <button
          onClick={() => setMode("create")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          Vender este vehículo
        </button>
      ) : (
        <div className="space-y-4">
          <SearchSelectTW
            label="Vendedor (opcional)"
            value={seller}
            onChange={setSeller}
            placeholder="Buscar vendedor..."
            loadOptions={async (q) => {
              const res = await fetchJson(`/api/bff/store-settings/members?q=${encodeURIComponent(q)}`);
              return (res?.items || []).map((u: any) => ({
                value: u.id,
                label: u.fullName || u.email,
                sublabel: u.email
              }));
            }}
          />
          <SearchSelectTW
            label="Cliente (opcional)"
            value={customer}
            onChange={setCustomer}
            loadOptions={async (q) => {
              const res = await fetchJson(`/api/bff/customers?q=${encodeURIComponent(q)}&page=1&pageSize=5`);
              return (res?.items || []).map((c: any) => ({
                value: c.id,
                label: c.fullName || c.email,
                sublabel: c.phone
              }));
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
            <input
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 py-2 px-3 border"
              value={soldPrice}
              onChange={e => setSoldPrice(e.target.value)}
              placeholder="Ej: 45000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 py-2 px-3 border"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
              onClick={handleSale}
              disabled={loading}
            >
              {loading ? "..." : "Confirmar Venta"}
            </button>
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm"
              onClick={() => setMode("view")}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Historial Reciente</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
            <span>Cotización enviada via WhatsApp</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
            <span>Interés mostrado por <strong>Juan Pérez</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaManagerTW({ vehicleId }: { vehicleId: string }) {
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const res = await fetchJson(`/api/bff/vehicles/${vehicleId}/media`);
      setMedia(Array.isArray(res?.data) ? res.data : []);
    } catch { }
  }

  useEffect(() => { if (vehicleId) load(); }, [vehicleId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(e.target.files).forEach(f => fd.append("files", f));
    fd.append("isCoverFirst", "false");
    try {
      await fetch(`/api/bff/vehicles/${vehicleId}/media/upload-many`, { method: "POST", body: fd });
      await load();
    } catch {
      alert("Error subiendo fotos");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar imagen?")) return;
    await fetch(`/api/bff/vehicles/${vehicleId}/media/${id}?deleteFile=true`, { method: "DELETE" });
    load();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Media Manager</h3>
        <span className="text-xs text-gray-500">Máximo 10 fotos (PNG, JPG)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((m) => (
          <div key={m.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img src={m.url} className="w-full h-full object-cover" />
            <button
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(m.id)}
            >
              <IconTrash className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors aspect-square">
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          <div className="bg-gray-100 p-3 rounded-full mb-2">
            <IconUpload className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-600">{uploading ? "..." : "SUBIR FOTO"}</span>
        </label>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function VehicleEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const sp = useSearchParams();
  const router = useRouter();
  const returnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? "/inventory", [sp]);

  // Data state
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [branchId, setBranchId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [vin, setVin] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Catalogs
  const [branches, setBranches] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [v, b1, b2, vt] = await Promise.all([
          getVehicle(id),
          fetchJson("/api/bff/branches"),
          fetchJson("/api/bff/brands"),
          fetchJson("/api/bff/vehicle-types").catch(() => [])
        ]);
        setVehicle(v);
        setBranches(Array.isArray(b1) ? b1 : b1?.data ?? []);
        setBrands(Array.isArray(b2) ? b2 : b2?.data ?? []);
        setVehicleTypes(Array.isArray(vt) ? vt : vt?.data ?? []);

        // Fill form
        if (v) {
          setBranchId(v.branch?.id || "");
          setBrandId(v.brand?.id || "");
          setModelId(v.model?.id || "");
          setTitle(v.title || "");
          setPrice(v.price ? String(v.price) : "");
          setYear(v.year ? String(v.year) : "");
          setMileage(v.mileage ? String(v.mileage) : "");
          setVin(v.vin || "");
          setDescription(v.description || "");
          setColor(v.color || "");
          setTransmission(v.transmission || "");
          setFuelType(v.fuelType || "");
          setVehicleTypeId(v.vehicleTypeId || "");
          setIsPublished(!!v.isPublished);

          // prefetch models
          if (v.brand?.id) {
            const m = await fetchJson(`/api/bff/models?brandId=${v.brand.id}`);
            setModels(Array.isArray(m) ? m : m?.data ?? []);
          }
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Update models on brand change
  useEffect(() => {
    if (!brandId) return;
    fetchJson(`/api/bff/models?brandId=${brandId}`).then(res => {
      setModels(Array.isArray(res) ? res : res?.data ?? []);
    }).catch(() => { });
  }, [brandId]);

  const isArchived = vehicle?.status === "ARCHIVED";
  const statusColor = isArchived ? "bg-gray-200 text-gray-800" : (vehicle?.status === "SOLD" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800");
  const statusLabel = isArchived ? "ARCHIVADO" : vehicle?.status || "DISPONIBLE";

  async function handleSave() {
    setSaving(true);
    try {
      await updateVehicle(id, {
        branchId, brandId, modelId,
        title: toStringOrUndefined(title),
        price: toStringOrUndefined(price),
        year: toIntOrUndefined(year),
        mileage: toIntOrUndefined(mileage),
        vin: toStringOrUndefined(vin),
        description: toStringOrUndefined(description),
        color: toStringOrUndefined(color),
        transmission: toStringOrUndefined(transmission),
        fuelType: toStringOrUndefined(fuelType),
        vehicleTypeId: vehicleTypeId || undefined,
        isPublished
      });
      alert("Guardado!");
      // Refresh logic if needed or stay
    } catch {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!confirm("Archivar vehículo?")) return;
    try {
      await updateVehicle(id, { status: "ARCHIVED" } as any);
      window.location.reload();
    } catch {
      alert("Error archivando");
    }
  }

  const user = useUser();
  const canArchive = user.isSuperAdmin || user.roles.includes("admin") || user.roles.includes("supervisor");

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando vehículo...</div>;
  if (!vehicle) return <div className="p-8 text-center">Vehículo no encontrado. <Link href="/inventory" className="text-blue-600">Volver</Link></div>;

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border";
  const selectClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white";
  const sectionClass = "bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb + Warning if archived */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/inventory" className="hover:text-blue-600">Inventario</Link>
            <span className="mx-2">/</span>
            <span>Editar Vehículo</span>
          </div>

          {isArchived && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 flex items-center gap-3 text-yellow-800 text-sm">
              <IconArchive className="w-5 h-5" />
              <div>
                <strong>Este vehículo está archivado</strong>
                <p>Los cambios no se guardarán hasta que el vehículo sea restaurado.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {title || "Sin Título"}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusColor}`}>
                {statusLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Publicado Switch */}
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 mr-2">
                <span className="text-sm text-gray-600 mr-2">Publicado</span>
                <button
                  onClick={() => !isArchived && setIsPublished(!isPublished)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isPublished ? "bg-blue-600" : "bg-gray-300"} ${isArchived ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPublished ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>

              {canArchive && (
                <button onClick={handleArchive} disabled={isArchived} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50">
                  <IconArchive className="w-4 h-4 mr-2 text-red-500" />
                  Archivar
                </button>
              )}

              <Link href={returnTo} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                <IconArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>

              <button
                onClick={handleSave}
                disabled={saving || isArchived}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <div className={sectionClass}>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Información General</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Tipo de Vehículo</label>
                  <select className={selectClass} value={vehicleTypeId} onChange={e => setVehicleTypeId(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Marca</label>
                  <select className={selectClass} value={brandId} onChange={e => setBrandId(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Modelo</label>
                  <select className={selectClass} value={modelId} onChange={e => setModelId(e.target.value)} disabled={isArchived || !brandId}>
                    <option value="">Seleccione...</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Año</label>
                  <select className={selectClass} value={year} onChange={e => setYear(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const y = new Date().getFullYear() + 1 - i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>VIN / Chasis</label>
                  <input className={inputClass} value={vin} onChange={e => setVin(e.target.value)} disabled={isArchived} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Precio (USD)</label>
                  <input className={inputClass} value={price} onChange={e => setPrice(e.target.value)} disabled={isArchived} />
                </div>
                <div>
                  <label className={labelClass}>Kilometraje</label>
                  <input className={inputClass} value={mileage} onChange={e => setMileage(e.target.value)} disabled={isArchived} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Color</label>
                  <select className={selectClass} value={color} onChange={e => setColor(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    <option value="Blanco">Blanco</option>
                    <option value="Negro">Negro</option>
                    <option value="Gris">Gris</option>
                    <option value="Plata">Plata</option>
                    <option value="Azul">Azul</option>
                    <option value="Rojo">Rojo</option>
                    {color && !["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo"].includes(color) && <option value={color}>{color}</option>}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transmisión</label>
                  <select className={selectClass} value={transmission} onChange={e => setTransmission(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Combustible</label>
                  <select className={selectClass} value={fuelType} onChange={e => setFuelType(e.target.value)} disabled={isArchived}>
                    <option value="">Seleccione...</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Descripción</label>
                <textarea className={inputClass} rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={isArchived} />
              </div>
            </div>

            {/* Media Manager */}
            <MediaManagerTW vehicleId={id} />
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            <ReservationCard vehicleId={id} status={vehicle.status ?? ""} />

            <SaleCard
              vehicleId={id}
              sale={vehicle.sale}
              onSaleRecorded={() => {
                window.location.reload();
              }}
            />

            {/* Info Sistema */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado por</span>
                  <span className="font-medium text-gray-900">Admin Central</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha creación</span>
                  <span className="font-medium text-gray-900">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Días en inventario</span>
                  <span className="font-medium text-gray-900">
                    {vehicle.createdAt ? Math.floor((Date.now() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0} días
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última edición</span>
                  <span className="font-medium text-gray-900">{vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleTimeString() : "-"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
