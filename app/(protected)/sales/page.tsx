"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  applySalesFilters,
  fetchAllSales,
  groupBySeller,
  money,
  summarizeSales,
  type Sale,
} from "@/lib/sales";

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
  )
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
  )
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

type Option = { value: string; label: string };

export default function SalesPage() {
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

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12; // Adjusted for new layout

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

  // Derived Options
  const brandOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      if (s.vehicle?.brand?.id && s.vehicle?.brand?.name) {
        map.set(s.vehicle.brand.id, s.vehicle.brand.name);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

  const modelOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const m = s.vehicle?.model;
      const b = s.vehicle?.brand;
      if (!m?.id || !m?.name) continue;
      if (brandId && b?.id !== brandId) continue;
      map.set(m.id, m.name);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all, brandId]);

  const sellerOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of all) {
      const id = s.soldByUserId;
      const label = s.soldBy?.fullName || s.soldBy?.email || id;
      map.set(id, label);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);

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
  }, [filtered, pageSafe, pageSize]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [from, to, brandId, modelId, sellerId, q]);

  // Styles
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm";
  const selectClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white text-sm";
  const cardClass = "bg-white p-6 rounded-lg shadow-sm border border-gray-100";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Link href="/" className="hover:text-blue-600">Inicio</Link>
                <span className="mx-2">/</span>
                <span>Ventas</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Reporte de Ventas</h1>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <IconRefresh className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando..." : "Refrescar"}
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>Desde</label>
                <input type="date" className={inputClass} value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Hasta</label>
                <input type="date" className={inputClass} value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Marca</label>
                <select className={selectClass} value={brandId} onChange={e => { setBrandId(e.target.value); setModelId(""); }}>
                  <option value="">Todas las marcas</option>
                  {brandOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Vendedor</label>
                <select className={selectClass} value={sellerId} onChange={e => setSellerId(e.target.value)}>
                  <option value="">Todos los vendedores</option>
                  {sellerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Buscar</label>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    placeholder="Cliente o Vehículo..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-md shadow-sm transition-colors">
                    <IconFilter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {err && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {err}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={cardClass + " flex items-center justify-between"}>
            <div>
              <p className={labelClass}>TOTAL VENTAS (UNIDADES)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalSales}</p>
              <p className="text-xs text-green-600 mt-2 font-medium">↗ +12% vs mes anterior (mock)</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-full">
              <IconShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className={cardClass + " flex items-center justify-between"}>
            <div>
              <p className={labelClass}>MONTO TOTAL FACTURADO ($)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{money(summary.totalAmount)}</p>
              <p className="text-xs text-green-600 mt-2 font-medium">↗ +8.4% vs mes anterior (mock)</p>
            </div>
            <div className="bg-green-50 p-4 rounded-full">
              <IconDollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Ventas por Vendedor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <IconUsers className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900">Ventas por Vendedor</h3>
              </div>
              <div>
                {sellerSummary.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">Sin datos</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="px-4 py-3">Vendedor</th>
                        <th className="px-4 py-3 text-right">#</th>
                        <th className="px-4 py-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sellerSummary.map(r => (
                        <tr key={r.sellerId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{r.sellerName.split(" ")[0]}...</td>
                          <td className="px-4 py-3 text-right">{r.count}</td>
                          <td className="px-4 py-3 text-right font-medium">{money(r.amount).replace(/(\.00)$/, '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right: Listado de Ventas (Table) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <h3 className="font-bold text-gray-900">Listado de Ventas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Vehículo</th>
                      <th className="px-6 py-3">Precio Venta</th>
                      <th className="px-6 py-3">Vendedor</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
                    ) : pageRows.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay ventas registradas.</td></tr>
                    ) : (
                      pageRows.map(s => {
                        const veh = s.vehicle?.title ?? [s.vehicle?.brand?.name, s.vehicle?.model?.name, s.vehicle?.year].filter(Boolean).join(" ") ?? "N/A";
                        const client = s.customer?.fullName || s.lead?.fullName || "-";
                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-gray-500">{new Date(s.soldAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{veh}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{money(s.soldPrice)}</td>
                            <td className="px-6 py-4 text-gray-600 text-xs">{s.soldBy?.fullName || "N/A"}</td>
                            <td className="px-6 py-4 text-gray-600">{client}</td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/sales/${s.id}?returnTo=/sales`}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Ver detalle
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
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando {filtered.length > 0 ? (pageSafe - 1) * pageSize + 1 : 0} a {Math.min(pageSafe * pageSize, filtered.length)} de {filtered.length} registros
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pageSafe <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Simple pagination logic for now (1..5)
                      // If many pages, this should be smarter, but suffices for mockup 
                      let p = i + 1;
                      if (pageSafe > 3 && totalPages > 5) p = pageSafe - 2 + i;
                      if (p > totalPages) return null;

                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 border rounded text-sm min-w-[32px] ${p === pageSafe ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
