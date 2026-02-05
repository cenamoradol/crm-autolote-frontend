"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { listLeads, type Lead, type LeadListMeta, type LeadStatus } from "@/lib/leads";

// --- Icons ---
function IconPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
function IconSearch({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
function IconFilter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
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

// --- Status Badge Helper ---
function StatusBadge({ status }: { status: LeadStatus | string }) {
  const raw = String(status || "").toUpperCase();
  let classes = "bg-gray-100 text-gray-800";
  let label = raw;

  if (raw === "NEW") {
    classes = "bg-blue-100 text-blue-800";
    label = "NUEVO";
  } else if (raw === "IN_PROGRESS" || raw === "CONTACTED") {
    classes = "bg-yellow-100 text-yellow-800";
    label = "EN PROGRESO";
  } else if (raw === "WON" || raw === "QUALIFIED") {
    classes = "bg-green-100 text-green-800";
    label = "GANADO";
  } else if (raw === "LOST" || raw === "DISQUALIFIED") {
    classes = "bg-red-100 text-red-800";
    label = "PERDIDO";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${classes}`}>
      {label}
    </span>
  );
}

export default function LeadsPage() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadListMeta>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters State
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [dateRange, setDateRange] = useState(""); // Visual placeholder

  const canFilter = useMemo(() => q.trim().length === 0 || q.trim().length >= 2, [q]);

  async function load(page: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listLeads({
        page,
        limit: meta.limit,
        q: q.trim().length >= 2 ? q.trim() : undefined,
        status: (status || undefined) as LeadStatus | undefined,
        sortBy: "createdAt",
        sortDir: "desc"
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e?.message || "Error cargando leads");
    } finally {
      setLoading(false);
    }
  }

  // Load on mount and URL change
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setStatus(sp.get("status") ?? "");
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canFilter) return;

    const qs = new URLSearchParams(sp.toString());
    if (q.trim().length >= 2) qs.set("q", q.trim()); else qs.delete("q");
    if (status) qs.set("status", status); else qs.delete("status");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    router.replace(nextUrl);
  }

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("q");
    qs.delete("status");
    router.replace(`${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`);

    setQ("");
    setStatus("");
    setDateRange("");
  }

  // Styles
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm";
  const selectClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1";
  const returnTo = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Leads</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Leads</h1>
              <p className="text-gray-500 mt-1 text-sm">Administra y da seguimiento a tus prospectos de venta.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => load(meta.page)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <IconRefresh className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Actualizando..." : "Refrescar"}
              </button>
              <Link
                href={`/leads/new?returnTo=${encodeURIComponent(returnTo)}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Crear Lead
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className={labelClass}>Estado</label>
              <select className={selectClass} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="NEW">Nuevo</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="WON">Ganado</option>
                <option value="LOST">Perdido</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Búsqueda rápida</label>
              <div className="relative">
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Nombre, tel o email"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Rango de fechas</label>
              <input
                type="date"
                className={inputClass}
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                placeholder="Seleccionar rango"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${!canFilter ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!canFilter}
              >
                <IconFilter className="w-4 h-4 mr-2" />
                Filtrar
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{err}</span>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fuente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente Asociado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando leads...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron leads.</td>
                  </tr>
                ) : (
                  items.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{lead.fullName ?? "Sin nombre"}</span>
                          <span className="text-xs text-gray-500">{lead.email}</span>
                          <span className="text-xs text-gray-500">{lead.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={lead.status ?? "NEW"} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.source ?? "Directo"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {lead.customer ? (
                          <Link href={`/customers/${lead.customer.id}`} className="hover:underline">
                            {lead.customer.fullName}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/leads/${lead.id}?returnTo=${encodeURIComponent(returnTo)}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs shadow-sm transition-colors"
                          >
                            Gestionar
                          </Link>
                          <Link
                            href={`/leads/${lead.id}/edit?returnTo=${encodeURIComponent(returnTo)}`}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded text-xs shadow-sm transition-colors"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {items.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} a {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => load(meta.page - 1)}
                disabled={loading || meta.page <= 1}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
              >
                <IconChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              <button
                onClick={() => load(meta.page + 1)}
                disabled={loading || meta.page >= meta.totalPages}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
              >
                Siguiente
                <IconChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
