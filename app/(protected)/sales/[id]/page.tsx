"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getSaleFromList,
  money,
  uploadSaleDocument,
  removeSaleDocument,
  updateSale,
  type Sale,
  type SaleDocument
} from "@/lib/sales";
import { getVehicle, type Vehicle } from "@/lib/vehicles";
import { useUser } from "@/components/providers/UserProvider";
import SearchSelectTW from "@/components/common/SearchSelectTW";
import toast from "react-hot-toast";

// --- Icons ---
function IconMail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconFileText({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
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
function IconExternalLink({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}
function IconPhone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/sales";
  const user = useUser();

  const [sale, setSale] = useState<Sale | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDoc, setSavingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [editPrice, setEditPrice] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSeller, setEditSeller] = useState<{ value: string; label: string; sublabel?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const s = await getSaleFromList(id);
      setSale(s || null);
      if (s) {
        setEditPrice(s.soldPrice ? String(s.soldPrice) : "");
        setEditNotes(s.notes || "");
        if (s.soldBy) {
          setEditSeller({ value: s.soldByUserId, label: s.soldBy.fullName || s.soldBy.email || "Sin asignar" });
        }
      }
      if (s?.vehicleId) {
        getVehicle(s.vehicleId).then(setVehicleDetail).catch(() => null);
      }
    } catch {
      setSale(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!sale || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSavingDoc(true);
    try {
      await uploadSaleDocument(sale.id, file);
      toast.success("Documento cargado correctamente");
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al subir");
    } finally {
      setSavingDoc(false);
    }
  }

  async function handleRemoveDoc(docId: string) {
    if (!sale) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) return;
    try {
      await removeSaleDocument(sale.id, docId);
      toast.success("Documento eliminado");
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar");
    }
  }

  async function loadMembers(query: string) {
    const res = await fetch(`/api/bff/store-settings/members?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const items = data.items || [];
    return items.map((m: any) => ({
      value: m.id,
      label: m.fullName || m.email,
      sublabel: m.email
    }));
  }

  async function handleSave() {
    if (!sale) return;
    setSaving(true);
    try {
      const payload: any = {};
      const newPrice = editPrice.trim();
      if (newPrice && newPrice !== String(sale.soldPrice)) {
        payload.soldPrice = Number(newPrice);
      }
      if (editNotes !== (sale.notes || "")) {
        payload.notes = editNotes;
      }
      if (editSeller && editSeller.value !== sale.soldByUserId) {
        payload.soldByUserId = editSeller.value;
      }
      if (Object.keys(payload).length === 0) {
        toast.success("Sin cambios por guardar");
        setIsEditing(false);
        return;
      }
      await updateSale(sale.id, payload);
      toast.success("Venta actualizada correctamente");
      setIsEditing(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando detalle...</p>
      </div>
    </div>
  );

  if (!sale) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
          <IconFileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Venta no encontrada</h2>
          <p className="text-slate-500 mb-6">El registro que buscas no existe o ha sido eliminado.</p>
          <Link href={returnTo} className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  const vehicleBasic = sale.vehicle;
  const vehicleFull = vehicleDetail;
  const vehicleTitle = vehicleFull?.title ?? vehicleBasic?.title ?? [vehicleBasic?.brand?.name, vehicleBasic?.model?.name, vehicleBasic?.year].filter(Boolean).join(" ") ?? "S/N";

  const sellerName = sale.soldBy?.fullName || sale.soldBy?.email || "Sin asignar";
  const customerName = sale.customer?.fullName || sale.lead?.fullName || "Consumidor Final";
  const customerEmail = sale.customer?.email || sale.lead?.email;
  const customerPhone = sale.customer?.phone || sale.lead?.phone;

  const isLocked = sale.status === 'COMPLETED';
  const permissions = user?.permissions || [];
  const canOverride = user?.isSuperAdmin || permissions.includes("sales:override_closed");

  const formattedDate = new Date(sale.soldAt).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = new Date(sale.soldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-xs text-slate-400 font-black uppercase tracking-widest mb-1">
            <Link href="/sales" className="hover:text-indigo-600 transition-colors">Ventas</Link>
            <span className="mx-2 text-slate-200">/</span>
            <span className="text-indigo-600">ID #{sale.id.slice(0, 8)}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Detalle de Venta
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                  Transacción Finalizada
                </span>
                <span className="text-slate-400 text-xs font-bold tracking-tight">#{sale.id}</span>
              </div>
            </div>
            <Link
              href={returnTo}
              className="inline-flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all uppercase tracking-widest"
            >
              Cerrar
            </Link>

            {canOverride && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all uppercase tracking-widest border border-indigo-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                Editar
              </button>
            )}

            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsEditing(false); setEditPrice(sale.soldPrice ? String(sale.soldPrice) : ""); setEditNotes(sale.notes || ""); if (sale.soldBy) setEditSeller({ value: sale.soldByUserId, label: sale.soldBy.fullName || sale.soldBy.email || "" }); }}
                  className="inline-flex items-center px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Payment & Status */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2.5 rounded-2xl border border-indigo-100">
                    <IconFileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Resumen de Venta</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Información financiera</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Facturado</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="text-2xl font-black text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1 text-right w-48 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                    />
                  ) : (
                    <p className="text-3xl font-black text-indigo-600">{money(sale.soldPrice)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha y Hora</label>
                  <p className="text-slate-900 font-bold text-sm tracking-tight">{formattedDate}</p>
                  <p className="text-slate-400 font-medium text-xs mt-0.5">{formattedTime}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Canal / Medio</label>
                  <p className="text-slate-900 font-bold text-sm tracking-tight">{(sale.lead as any)?.source || "Venta Directa"}</p>
                  <p className="text-slate-400 font-medium text-xs mt-0.5 uppercase tracking-widest">Procesado</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Estatus</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className={`font-black text-xs uppercase tracking-widest ${isLocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {sale.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Notas Internas</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={4}
                    placeholder="Agregar notas internas sobre la venta..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:border-indigo-300 transition-all resize-none"
                  />
                </div>
              ) : sale.notes ? (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Notas Internas</label>
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{sale.notes}"</p>
                </div>
              ) : null}
            </div>

            {/* Internal Documentation */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
                    <IconFileText className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Documentación Interna</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Archivos y PDF adjuntos</p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={savingDoc || (isLocked && !canOverride)}
                  className={`inline-flex items-center px-4 py-2 font-bold rounded-xl transition-all text-xs uppercase tracking-widest shadow-lg ${isLocked && !canOverride
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200'
                    }`}
                >
                  <IconPlus className="w-3 h-3 mr-2" />
                  {savingDoc ? "Subiendo..." : "Adjuntar"}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
              </div>

              {!sale.documents || sale.documents.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50/50">
                  <IconFileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sin documentos cargados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sale.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-indigo-500 shadow-sm group-hover:bg-indigo-50 transition-colors">
                          <IconFileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all"
                        >
                          <IconExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleRemoveDoc(doc.id)}
                          disabled={isLocked && !canOverride}
                          className={`p-2 rounded-lg transition-all ${isLocked && !canOverride
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-300 hover:text-rose-500 hover:bg-white'
                            }`}
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">

            {/* Vehicle Preview Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="relative h-56 bg-slate-200 group overflow-hidden">
                {vehicleFull?.media?.[0] ? (
                  <img src={vehicleFull.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
                    <IconPlus className="w-8 h-8 opacity-20 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {vehicleFull?.publicId || "STK-????"}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{vehicleTitle}</h3>
                  <Link href={`/inventory/${sale.vehicleId}`} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100">
                    <IconExternalLink className="w-5 h-5" />
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Año</span>
                    <span className="text-sm font-bold text-slate-800">{vehicleFull?.year || vehicleBasic?.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca</span>
                    <span className="text-sm font-bold text-slate-800">{vehicleFull?.brand?.name || vehicleBasic?.brand?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VIN</span>
                    <span className="text-xs font-black text-indigo-600">{vehicleFull?.vin || "---"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
                  <IconUser className="w-5 h-5" />
                </div>
                <h3 className="text-md font-black text-slate-800 tracking-tight uppercase">Participantes</h3>
              </div>

              {/* Vendedor */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asesor Responsable</label>
                {isEditing ? (
                  <SearchSelectTW
                    label=""
                    value={editSeller}
                    onChange={setEditSeller}
                    placeholder="Buscar vendedor..."
                    loadOptions={loadMembers}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                      {sellerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{sellerName}</p>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Vendedor</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cliente */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Información del Cliente</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 uppercase">
                    {customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 truncate max-w-[150px]">{customerName}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{sale.leadId ? "Lead" : "Cliente Directo"}</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-xs space-y-3 shadow-sm font-medium">
                  {customerEmail && (
                    <div className="flex items-center gap-3 text-slate-600 break-all">
                      <IconMail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{customerEmail}</span>
                    </div>
                  )}
                  {customerPhone && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <IconPhone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{customerPhone}</span>
                    </div>
                  )}
                  {!customerEmail && !customerPhone && (
                    <p className="text-slate-300 italic">Sin datos de contacto</p>
                  )}
                </div>
              </div>

              {vehicleFull?.consignor && (
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dueño (Consignatario)</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                      {vehicleFull.consignor.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{vehicleFull.consignor.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Propietario</p>
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
