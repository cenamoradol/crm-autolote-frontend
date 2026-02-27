"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  applySalesFilters,
  fetchAllSales,
  groupBySeller,
  summarizeSales,
  createSale,
  uploadSaleDocument,
  removeSaleDocument,
  type Sale,
  type SaleDocument,
} from "@/lib/sales";
import { useUser } from "@/components/providers/UserProvider";
import { formatPrice } from "@/lib/currency";
import SearchSelectTW from "@/components/common/SearchSelectTW";
import { listVehicles } from "@/lib/vehicles";
import { listCustomers } from "@/lib/customers";
import { listLeads } from "@/lib/leads";
import toast from "react-hot-toast";
import { useRef } from "react";

// --- Icons ---
function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
function IconFilter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
function IconShoppingCart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
function IconDollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconFile({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type Option = { value: string; label: string; sublabel?: string };

export default function SalesPage() {
  const user = useUser();
  const money = (v: any) => formatPrice(v, user.currencySymbol, user.currency);

  const [all, setAll] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [sellerId, setSellerId] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState<Sale | null>(null);
  const [saving, setSaving] = useState(false);

  // New Sale State
  const [newVehicle, setNewVehicle] = useState<Option | null>(null);
  const [newCustomer, setNewCustomer] = useState<Option | null>(null);
  const [newLead, setNewLead] = useState<Option | null>(null);
  const [newSeller, setNewSeller] = useState<Option | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPrice, setNewPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchAllSales();
      setAll(data);
    } catch (e: any) {
      setErr(e?.message || "No se pudo cargar ventas");
      setAll([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [from, to, brandId, modelId, sellerId, q]);

  // Derived Options for Filters
  const brandOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      if (s.vehicle?.brand?.id && s.vehicle?.brand?.name) {
        map.set(s.vehicle.brand.id, s.vehicle.brand.name);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const sellerOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const id = s.soldByUserId;
      const label = s.soldBy?.fullName || s.soldBy?.email || id;
      map.set(id, label);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Data
  const filtered = useMemo(() => {
    return applySalesFilters(all, {
      from: from || undefined,
      to: to || undefined,
      brandId: brandId || undefined,
      modelId: modelId || undefined,
      sellerId: sellerId || undefined,
      q: q || undefined
    });
  }, [all, from, to, brandId, modelId, sellerId, q]);

  const summary = useMemo(() => summarizeSales(filtered), [filtered]);
  const sellerSummary = useMemo(() => groupBySeller(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  async function handleCreateSale() {
    if (!newVehicle) return toast.error("Selecciona un vehículo");
    setSaving(true);
    try {
      const res = await createSale({
        vehicleId: newVehicle.value,
        customerId: newCustomer?.value,
        leadId: newLead?.value,
        soldPrice: parseFloat(newPrice) || undefined,
        notes: newNotes,
        soldByUserId: newSeller?.value || user?.id,
      });

      const saleId = (res as any).id;

      // Upload optional files
      if (newFiles.length > 0 && saleId) {
        for (const file of newFiles) {
          try {
            await uploadSaleDocument(saleId, file);
          } catch (e) {
            console.error("Error uploading file:", e);
          }
        }
      }

      toast.success("Venta registrada con éxito");
      setShowNewModal(false);
      // Reset state
      setNewVehicle(null);
      setNewCustomer(null);
      setNewLead(null);
      setNewSeller(null);
      setNewFiles([]);
      setNewPrice("");
      setNewNotes("");
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al crear venta");
    } finally {
      setSaving(false);
    }
  }

  // --- Search Adapters ---
  async function loadVehicles(query: string) {
    const data = await listVehicles({ search: query, status: "AVAILABLE" });
    return data.map(v => ({
      value: v.id,
      label: `${v.brand?.name} ${v.model?.name} (${v.year})`,
      sublabel: `${v.vin || v.stockNumber || v.publicId} - ${formatPrice(v.price, user.currencySymbol, user.currency)}`
    }));
  }

  async function loadCustomers(query: string) {
    const res = await listCustomers({ q: query });
    return res.data.map(c => ({
      value: c.id,
      label: c.fullName,
      sublabel: `${c.phone || ""} ${c.email || ""}`
    }));
  }

  async function loadLeads(query: string) {
    const res = await listLeads({ q: query, status: "IN_PROGRESS" });
    return res.data.map(l => ({
      value: l.id,
      label: l.fullName || "(Sin nombre)",
      sublabel: `Lead ${l.status} - Source: ${l.source || "N/A"}`
    }));
  }

  async function loadMembers(query: string) {
    const res = await fetch(`/api/bff/store-settings/members?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const items = data.items || [];
    return items.map((m: any) => ({
      value: m.id,
      label: m.fullName || m.email,
      sublabel: m.permissions ? `Permissions: ${m.permissions.length}` : m.email
    }));
  }

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
  }

  function removeStagedFile(index: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!showDocModal || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSaving(true);
    try {
      await uploadSaleDocument(showDocModal.id, file);
      toast.success("Documento cargado");
      load(); // Reload all to get updated documents
      // We also update the local modal state if we want to see it instantly without full reload
      // But full reload is safer for ahora
      setShowDocModal(null);
    } catch (e: any) {
      toast.error(e.message || "Error al subir");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDoc(docId: string) {
    if (!showDocModal) return;
    if (!confirm("¿Borrar este documento?")) return;
    try {
      await removeSaleDocument(showDocModal.id, docId);
      toast.success("Documento borrado");
      load();
      setShowDocModal(null);
    } catch (e: any) {
      toast.error(e.message || "Error al borrar");
    }
  }

  // Styles
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none";
  const selectClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none";
  const cardClass = "bg-white rounded-2xl p-6 shadow-sm border border-slate-100";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
                <Link href="/" className="hover:text-indigo-600">Dashboard</Link>
                <span className="mx-2">/</span>
                <span className="text-indigo-600">Ventas</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registro de Ventas</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <IconRefresh className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando..." : "Actualizar"}
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Nueva Venta
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <label className={labelClass}>Desde</label>
              <input type="date" className={inputClass} value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Hasta</label>
              <input type="date" className={inputClass} value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Marca</label>
              <select className={selectClass} value={brandId} onChange={e => setBrandId(e.target.value)}>
                <option value="">Todas las marcas</option>
                {brandOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Vendedor</label>
              <select className={selectClass} value={sellerId} onChange={e => setSellerId(e.target.value)}>
                <option value="">Todos</option>
                {sellerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className={labelClass}>Búsqueda</label>
              <div className="relative">
                <input
                  className={inputClass + " pr-10"}
                  placeholder="VIN, Cliente, Notas..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                <IconFilter className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {err && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="bg-rose-100 p-2 rounded-lg">⚠️</div>
            <p className="font-medium text-sm">{err}</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={cardClass + " border-l-4 border-l-indigo-500 overflow-hidden relative"}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className={labelClass}>Ventas Totales</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{summary.totalSales}</p>
                <div className="mt-3 inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold ring-1 ring-indigo-200">
                  Resumen del periodo
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <IconShoppingCart className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            {/* Subtle background pattern */}
            <div className="absolute -right-10 -bottom-10 text-slate-50 opacity-10 pointer-events-none">
              <IconShoppingCart className="w-48 h-48" />
            </div>
          </div>

          <div className={cardClass + " border-l-4 border-l-emerald-500 overflow-hidden relative"}>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className={labelClass}>Total Facturado ({user.currency || "USD"})</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{money(summary.totalAmount)}</p>
                <div className="mt-3 inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-200">
                  {user.currencySymbol} Valor acumulado
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <IconDollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 text-slate-50 opacity-10 pointer-events-none">
              <IconDollarSign className="w-48 h-48" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sellers Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <IconUsers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 tracking-tight">Vendedores</h3>
              </div>
              <div className="p-2">
                {sellerSummary.length === 0 ? (
                  <div className="p-8 text-center text-sm font-medium text-slate-400">Sin ventas</div>
                ) : (
                  <div className="space-y-1">
                    {sellerSummary.map((s, idx) => (
                      <div key={s.sellerId} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{s.sellerName.split(" ")[0]}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{s.count} ventas</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-700">{money(s.amount).replace(/(\.00)$/, '')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 tracking-tight">Historial de Ventas</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
                  {filtered.length} Registros total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Vehículo</th>
                      <th className="px-6 py-4">Monto</th>
                      <th className="px-6 py-4">Comprador</th>
                      <th className="px-6 py-4 text-center">Docs</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2"></div><p className="text-slate-400 font-medium">Buscando ventas...</p></td></tr>
                    ) : pageRows.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium italic">No se encontraron ventas con los filtros aplicados.</td></tr>
                    ) : (
                      pageRows.map(s => {
                        const veh = s.vehicle?.title ?? [s.vehicle?.brand?.name, s.vehicle?.model?.name, s.vehicle?.year].filter(Boolean).join(" ") ?? "S/N";
                        const client = s.customer?.fullName || s.lead?.fullName || "-";
                        const docsCount = s.documents?.length || 0;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-6 py-4 text-slate-500 font-medium">{new Date(s.soldAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-xs">{veh}</span>
                                <span className="text-[10px] text-slate-400 font-bold tracking-wider">{s.vehicle?.publicId || "---"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black text-slate-900">{money(s.soldPrice)}</td>
                            <td className="px-6 py-4 text-slate-600">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                  {client.charAt(0)}
                                </div>
                                <span className="text-xs font-bold">{client}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setShowDocModal(s)}
                                className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold transition-all ${docsCount > 0 ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-50 text-slate-300 border border-slate-100 hover:text-indigo-600 hover:border-indigo-400"}`}
                              >
                                <IconFile className="w-3 h-3 mr-1" />
                                {docsCount}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/sales/${s.id}`}
                                className="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase tracking-widest hover:underline"
                              >
                                Detalle
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 p-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filtered.length > 0 ? (pageSafe - 1) * pageSize + 1 : 0} - {Math.min(pageSafe * pageSize, filtered.length)} de {filtered.length}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pageSafe <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-1 font-black text-slate-400 text-xs mx-2">
                    <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{pageSafe}</span>
                    <span className="px-1 text-slate-200">/</span>
                    <span>{totalPages}</span>
                  </div>
                  <button
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Nueva Venta */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Registrar Nueva Venta</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completa los datos de la transacción</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <SearchSelectTW
                  label="Vehículo Vendido"
                  placeholder="Marca, modelo o VIN..."
                  value={newVehicle}
                  onChange={setNewVehicle}
                  loadOptions={loadVehicles}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SearchSelectTW
                    label="Cliente (Opcional)"
                    placeholder="Nombre, teléfono..."
                    value={newCustomer}
                    onChange={setNewCustomer}
                    loadOptions={loadCustomers}
                  />
                </div>
                <div>
                  <SearchSelectTW
                    label="Lead de Origen (Opcional)"
                    placeholder="Nombre del lead..."
                    value={newLead}
                    onChange={setNewLead}
                    loadOptions={loadLeads}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SearchSelectTW
                    label="Vendedor que cerró la venta"
                    placeholder="Buscar miembro del equipo..."
                    value={newSeller}
                    onChange={setNewSeller}
                    loadOptions={loadMembers}
                  />
                </div>
                <div>
                  <label className={labelClass}>Precio de Venta ({user.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    placeholder="0.00"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 border-t border-slate-50 pt-6">
                <div>
                  <label className={labelClass}>Documentación Interna (Opcional - PDFs, fotos)</label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-wrap gap-2">
                      {newFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100 group">
                          <IconFile className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[150px]">{f.name}</span>
                          <button onClick={() => removeStagedFile(i)} className="text-indigo-400 hover:text-rose-500 transition-colors">
                            <IconX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group">
                      <IconPlus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 uppercase tracking-widest">
                        Agregar Archivos / PDF
                      </span>
                      <input type="file" multiple className="hidden" onChange={handleAddFiles} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>Fecha de Venta</label>
                  <input
                    type="date"
                    className={inputClass}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Notas Internas</label>
                <textarea
                  className={inputClass + " min-h-[100px]"}
                  placeholder="Detalles adicionales, arreglos realizados, etc..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSale}
                disabled={saving || !newVehicle}
                className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {saving ? "Registrando..." : "Confirmar Venta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Documentación */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 tracking-tight">Documentación Adjunta</h2>
              <button onClick={() => setShowDocModal(null)} className="text-slate-400 hover:text-slate-600"><IconX className="w-5 h-5" /></button>
            </div>

            <div className="p-6">
              {!showDocModal.documents || showDocModal.documents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <IconFile className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin documentos</p>
                  <p className="text-xs text-slate-400 mt-1">No hay archivos adjuntos en esta venta.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {showDocModal.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-indigo-500">
                          <IconFile className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-indigo-600 hover:bg-white rounded-xl transition-all font-bold text-xs uppercase"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs uppercase ml-1"
                      >
                        Borrar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
              />

              <button
                className="w-full mt-6 py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <IconPlus className="w-4 h-4" />
                {saving ? "Cargando..." : "Cargar Nuevo Documento"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
