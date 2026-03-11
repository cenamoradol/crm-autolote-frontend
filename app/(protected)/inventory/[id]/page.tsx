"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getVehicle, updateVehicle, type Vehicle, type VehicleUpsertPayload } from "@/lib/vehicles";
import { getReservationByVehicle, type Reservation } from "@/lib/reservations";
import SearchSelectTW from "@/components/common/SearchSelectTW";
import { listColors } from "@/lib/catalog";
import { useUser } from "@/components/providers/UserProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function toFloatOrUndefined(v: string | number | undefined): number | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

// --- Components ---

// Simple Search Select (Tailwind version)

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
          onClick={() => toast.success("Funcionalidad de crear reserva pendiente de modal.")}
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
  const permissions = user.permissions || [];
  const canManageSales = user.isSuperAdmin || permissions.includes("sales:create");

  async function handleSale() {
    if (!soldPrice) return toast.error("Precio es requerido");
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
      toast.success("Venta registrada");
      onSaleRecorded();
      setMode("view");
    } catch (e) {
      toast.error("No se pudo registrar la venta");
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

function SortableMediaItem({ m, handleDelete, handleSetCover, reordering, disabled }: { m: any, handleDelete: (id: string) => void, handleSetCover: (id: string) => void, reordering: boolean, disabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: m.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-200 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="w-full h-full">
        {m.kind === 'VIDEO' ? (
          <div className="relative w-full h-full">
            <video src={m.url} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" className="opacity-70">
                <path d="m7 4 12 8-12 8V4z" />
              </svg>
            </div>
          </div>
        ) : (
          <img src={m.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        )}
      </div>

      <div className="absolute inset-0 bg-black opacity-20 transition-all pointer-events-none" />

      <div className="absolute top-1 right-1 flex gap-1 opacity-100 transition-opacity">
        {!disabled && !m.isCover && (
          <button
            className="bg-yellow-400/90 text-yellow-900 p-1.5 rounded-full hover:bg-yellow-500 shadow-sm pointer-events-auto backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); handleSetCover(m.id); }}
            title="Establecer como portada"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
        {!disabled && (
          <button
            className="bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm pointer-events-auto backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
            title="Eliminar"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {m.isCover && (
        <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          PORTADA
        </div>
      )}
    </div>
  );
}

function MediaManagerTW({ vehicleId, disabled }: { vehicleId: string, disabled?: boolean }) {
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function load() {
    try {
      const res = await fetchJson(`/api/bff/vehicles/${vehicleId}/media`);
      setMedia(Array.isArray(res?.data) ? res.data : []);
    } catch { }
  }

  useEffect(() => { if (vehicleId) load(); }, [vehicleId]);

  /** Convierte un File a WebP usando Canvas manteniendo dimensiones originales */
  function convertToWebp(file: File, quality = 0.82): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("No se pudo convertir a WebP"));
            const baseName = file.name.replace(/\.[^.]+$/, "");
            const webpFile = new File([blob], `${baseName}.webp`, { type: "image/webp" });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.src = objectUrl;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;
    if (disabled) return;

    setUploading(true);
    const fileArray = Array.from(rawFiles);
    const total = fileArray.length;
    setUploadCount(total);

    try {
      let successCount = 0;
      let count = 0;

      for (let file of fileArray) {
        count++;

        // Toast id único para actualizar el mismo mensaje en pantalla
        const toastId = "upload-progress";

        // Convert options to webp
        if (file.type.startsWith("image/")) {
          toast.loading(`Preparando imagen ${count}/${total}...`, { id: toastId });
          try {
            file = await convertToWebp(file);
          } catch (err) {
            console.error("Error convirtiendo a WebP", err);
          }
        }

        toast.loading(`Subiendo imagen ${count}/${total}...`, { id: toastId });

        const fd = new FormData();
        fd.append("file", file);
        fd.append("isCover", "false");
        fd.append("kind", "IMAGE");

        const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/upload`, {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          successCount++;
        } else {
          console.error(`Error subiendo ${file.name}`);
        }
      }

      toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''} exitosamente`, { id: "upload-progress" });
      await load();
    } catch (err) {
      toast.error("Error en la subida de archivos", { id: "upload-progress" });
    } finally {
      setUploading(false);
      setUploadCount(0);
      // Limpiar input (opcional pero recomendado)
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (disabled) return;
    if (!confirm("Eliminar imagen?")) return;
    await fetch(`/api/bff/vehicles/${vehicleId}/media/${id}?deleteFile=true`, { method: "DELETE" });
    load();
  }

  async function handleSetCover(mediaId: string) {
    if (disabled) return;
    try {
      const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/${mediaId}/cover`, { method: "PATCH" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Portada actualizada");
      await load();
    } catch {
      toast.error("Error al establecer portada");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (disabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = media.findIndex((m) => m.id === active.id);
    const newIndex = media.findIndex((m) => m.id === over.id);

    const newMedia = arrayMove(media, oldIndex, newIndex);
    setMedia(newMedia);
    setReordering(true);

    try {
      const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newMedia.map(m => m.id) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Orden guardado");
    } catch (err) {
      toast.error("Error al reordenar");
      load();
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Media Manager</h3>
        <span className="text-xs text-gray-500">Máximo 10 fotos (PNG, JPG). Arrastra para reordenar.</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="relative">
          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 rounded-lg flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Subiendo {uploadCount} {uploadCount === 1 ? 'imagen' : 'imágenes'}...</p>
                <p className="text-xs text-slate-400 mt-0.5">Esto puede tomar unos segundos</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SortableContext items={media.map(m => m.id)} strategy={rectSortingStrategy}>
              {media.map((m) => (
                <SortableMediaItem key={m.id} m={m} handleDelete={handleDelete} handleSetCover={handleSetCover} reordering={reordering} disabled={disabled} />
              ))}
            </SortableContext>

            <label className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 transition-colors aspect-square ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-blue-500 hover:bg-blue-50"}`}>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading || disabled} />
              <div className="bg-gray-100 p-3 rounded-full mb-2">
                <IconUpload className="w-6 h-6 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{uploading ? "Subiendo..." : "Subir Media"}</span>
            </label>
          </div>
        </div>
      </DndContext>
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
  const [colorOption, setColorOption] = useState<{ value: string; label: string } | null>(null);
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isOffer, setIsOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [clearancePrice, setClearancePrice] = useState("");
  const [plate, setPlate] = useState("");
  const [consignor, setConsignor] = useState<{ value: string; label: string; sublabel?: string } | null>(null);
  const [engineSizeError, setEngineSizeError] = useState<string | null>(null);

  // Administrative Costs
  const [purchasePrice, setPurchasePrice] = useState("");
  const [repairCosts, setRepairCosts] = useState("");
  const [paperworkCosts, setPaperworkCosts] = useState("");
  const [otherCosts, setOtherCosts] = useState("");

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
          const vAny: any = v;
          if (vAny.colorRef) {
            setColorOption({ value: vAny.colorRef.id, label: vAny.colorRef.name });
          } else {
            setColorOption(null);
          }
          setTransmission(v.transmission || "");
          setFuelType(v.fuelType || "");
          setEngineSize(v.engineSize ? String(v.engineSize) : "");
          setVehicleTypeId(v.vehicleTypeId || "");
          setPlate(v.plate || "");
          setOfferPrice(v.offerPrice ? String(v.offerPrice) : "");
          setClearancePrice(v.clearancePrice ? String(v.clearancePrice) : "");
          setIsOffer(!!v.offerPrice);
          setIsPublished(!!v.isPublished);

          // Administrative Costs
          setPurchasePrice(v.purchasePrice ? String(v.purchasePrice) : "");
          setRepairCosts(v.repairCosts ? String(v.repairCosts) : "");
          setPaperworkCosts(v.paperworkCosts ? String(v.paperworkCosts) : "");
          setOtherCosts(v.otherCosts ? String(v.otherCosts) : "");

          if (v.consignor) {
            setConsignor({
              value: v.consignor.id,
              label: v.consignor.fullName,
              sublabel: v.consignor.phone || v.consignor.email || undefined
            });
          }

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
        colorId: colorOption?.value || undefined,
        transmission: toStringOrUndefined(transmission),
        fuelType: toStringOrUndefined(fuelType),
        engineSize: toFloatOrUndefined(engineSize),
        offerPrice: vehicle?.isClearance
          ? undefined
          : (isOffer ? toStringOrUndefined(offerPrice) : (offerPrice === "" ? null : undefined)),
        clearancePrice: vehicle?.isClearance
          ? (toStringOrUndefined(clearancePrice) ?? null)
          : undefined,
        plate: toStringOrUndefined(plate),
        vehicleTypeId: vehicleTypeId || undefined,
        purchasePrice: toStringOrUndefined(purchasePrice),
        repairCosts: toStringOrUndefined(repairCosts),
        paperworkCosts: toStringOrUndefined(paperworkCosts),
        otherCosts: toStringOrUndefined(otherCosts),
        isPublished,
        consignorId: consignor?.value || undefined
      });
      toast.success("Vehículo guardado correctamente!");
      // Refresh logic if needed or stay
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!confirm("Archivar vehículo?")) return;
    try {
      await updateVehicle(id, { status: "ARCHIVED" } as any);
      toast.success("Vehículo archivado");
      window.location.reload();
    } catch {
      toast.error("Error archivando vehículo");
    }
  }

  const user = useUser();
  const permissions = user.permissions || [];
  const isSold = vehicle?.status === "SOLD";

  const canOverride = user.isSuperAdmin || permissions.includes("sales:override_closed");

  const canArchive = (user.isSuperAdmin || permissions.includes("inventory:delete")) && (!isSold || canOverride);
  const canEdit = (user.isSuperAdmin || permissions.includes("inventory:update")) && (!isSold || canOverride);

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

          {isSold && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 mb-4 flex items-center gap-3 text-emerald-800 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <div>
                <strong>Este vehículo está liquidado (vendido)</strong>
                <p>Las ediciones están bloqueadas por seguridad para proteger el historial de la venta.</p>
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
              {canEdit && (
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 mr-2">
                  <span className="text-sm text-gray-600 mr-2">Publicado</span>
                  <button
                    onClick={() => !isArchived && setIsPublished(!isPublished)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isPublished ? "bg-blue-600" : "bg-gray-300"} ${isArchived ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPublished ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </div>
              )}

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

              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={saving || isArchived}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              )}
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

              <div className="mb-6">
                <label className={labelClass}>Nombre / Título del Vehículo</label>
                <input
                  className={inputClass}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  disabled={isArchived || !canEdit}
                  placeholder="Ej: Toyota Hilux 2022 Doble Cabina..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Tipo de Vehículo</label>
                  <select className={selectClass} value={vehicleTypeId} onChange={e => setVehicleTypeId(e.target.value)} disabled={isArchived || !canEdit}>
                    <option value="">Seleccione...</option>
                    {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Marca</label>
                  <select className={selectClass} value={brandId} onChange={e => setBrandId(e.target.value)} disabled={isArchived || !canEdit}>
                    <option value="">Seleccione...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Modelo</label>
                  <select className={selectClass} value={modelId} onChange={e => setModelId(e.target.value)} disabled={isArchived || !brandId || !canEdit}>
                    <option value="">Seleccione...</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Año</label>
                  <select className={selectClass} value={year} onChange={e => setYear(e.target.value)} disabled={isArchived || !canEdit}>
                    <option value="">Seleccione...</option>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const y = new Date().getFullYear() + 1 - i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>VIN / Chasis</label>
                  <input className={inputClass} value={vin} onChange={e => setVin(e.target.value)} disabled={isArchived || !canEdit} />
                </div>
                <div>
                  <label className={labelClass}>Número de Placa</label>
                  <input className={inputClass} value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} disabled={isArchived || !canEdit} placeholder="P AB 1234" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Precio ({user?.currency || "USD"})</label>
                  <input className={inputClass} value={price} onChange={e => setPrice(e.target.value)} disabled={isArchived || !canEdit} />
                </div>
                <div>
                  {vehicle?.isClearance ? (
                    <>
                      <label className={labelClass}>
                        <div className="flex items-center gap-2">
                          <span>Precio en Remate</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px]">local_offer</span>
                            Remate
                          </span>
                        </div>
                      </label>
                      <input
                        className={inputClass}
                        disabled={isArchived || !canEdit}
                        value={clearancePrice}
                        onChange={e => setClearancePrice(e.target.value)}
                        placeholder="Precio de remate"
                      />
                    </>
                  ) : (
                    <>
                      <label className={labelClass}>
                        <div className="flex items-center gap-2">
                          <span>En Oferta</span>
                          <button
                            type="button"
                            onClick={() => setIsOffer(!isOffer)}
                            disabled={isArchived || !canEdit}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOffer ? 'bg-orange-500' : 'bg-gray-200'} ${(isArchived || !canEdit) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOffer ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </label>
                      <input
                        className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                        disabled={!isOffer || isArchived || !canEdit}
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        placeholder="Precio oferta"
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Kilometraje</label>
                  <input className={inputClass} value={mileage} onChange={e => setMileage(e.target.value)} disabled={isArchived || !canEdit} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className={labelClass}>Color Exterior</label>
                  <SearchSelectTW
                    value={colorOption}
                    onChange={setColorOption}
                    placeholder="Buscar o seleccionar..."
                    disabled={isArchived || !canEdit}
                    loadOptions={async (query) => {
                      const colors = await listColors(query);
                      return colors.map((c) => ({ value: c.id, label: c.name }));
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Transmisión</label>
                  <select className={selectClass} value={transmission} onChange={e => setTransmission(e.target.value)} disabled={isArchived || !canEdit}>
                    <option value="">Seleccione...</option>
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Combustible</label>
                  <select className={selectClass} value={fuelType} onChange={e => setFuelType(e.target.value)} disabled={isArchived || !canEdit}>
                    <option value="">Seleccione...</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Motor (L)</label>
                  <input
                    className={`${inputClass} ${engineSizeError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    value={engineSize}
                    onChange={e => {
                      const val = e.target.value;
                      if (val && !/^\d*\.?\d*$/.test(val)) {
                        setEngineSizeError("Solo se permiten números decimales");
                      } else {
                        setEngineSizeError(null);
                      }
                      setEngineSize(val);
                    }}
                    disabled={isArchived || !canEdit}
                    placeholder="Ej: 2.0"
                  />
                  {engineSizeError && <p className="text-red-500 text-xs mt-1">{engineSizeError}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Descripción</label>
                <textarea className={inputClass} rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={isArchived || !canEdit} />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Consignación</h3>
                <SearchSelectTW
                  label="Consignatario (Dueño del Vehículo)"
                  value={consignor}
                  onChange={setConsignor}
                  placeholder="Buscar cliente por nombre, email o teléfono..."
                  loadOptions={async (q) => {
                    const res = await fetchJson(`/api/bff/consignors?q=${encodeURIComponent(q)}`);
                    return (res || []).map((c: any) => ({
                      value: c.id,
                      label: c.fullName,
                      sublabel: c.phone || c.email
                    }));
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Asigna al cliente dueño del vehículo si este es recibido en consignación para su venta.
                </p>
              </div>
            </div>

            {/* Section 4: Datos Administrativos */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconDollarSign className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Datos Administrativos</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Esta información es solo de uso interno para la administración y no será visible para los clientes.</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className={labelClass}>Precio de Compra</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={e => setPurchasePrice(e.target.value)}
                      disabled={isArchived || !canEdit}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Gastos de Reparaciones</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="0.00"
                      value={repairCosts}
                      onChange={e => setRepairCosts(e.target.value)}
                      disabled={isArchived || !canEdit}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Gastos de Papelería</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="0.00"
                      value={paperworkCosts}
                      onChange={e => setPaperworkCosts(e.target.value)}
                      disabled={isArchived || !canEdit}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Otros Gastos</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="0.00"
                      value={otherCosts}
                      onChange={e => setOtherCosts(e.target.value)}
                      disabled={isArchived || !canEdit}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Manager */}
            <MediaManagerTW vehicleId={id} disabled={isArchived || (isSold && !canOverride)} />
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
                  <span className="font-medium text-gray-900">
                    {vehicle.createdBy?.fullName || vehicle.createdBy?.email || "Sistema"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha creación</span>
                  <span className="font-medium text-gray-900">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Días en inventario</span>
                  <span className="font-medium text-gray-900">
                    {(() => {
                      if (!vehicle.createdAt) return "0";
                      const start = new Date(vehicle.createdAt).getTime();
                      const end = vehicle.sale?.soldAt ? new Date(vehicle.sale.soldAt).getTime() : Date.now();
                      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                      return Math.max(0, diffDays);
                    })()} días
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última edición</span>
                  <span className="font-medium text-gray-900">{vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleTimeString() : "-"}</span>
                </div>
              </div>

              {vehicle.consignor && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">CONSIGNATARIO (DUEÑO)</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {vehicle.consignor.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{vehicle.consignor.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{vehicle.consignor.phone || vehicle.consignor.email || "Sin contacto"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
