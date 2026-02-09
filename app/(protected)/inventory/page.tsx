"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { InlineAlert } from "@/components/ui/InlineAlert";
import { deleteVehicle, listVehicles, type Vehicle, type VehicleStatus } from "@/lib/vehicles";

function money(v: any) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function parsePublished(v: string): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  RESERVED: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  SOLD: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  ARCHIVED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

import { VehicleDetailsModal } from "@/components/inventory/VehicleDetailsModal";

export default function InventoryPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(sp.get("status") ?? "");
  const [published, setPublished] = useState<string>(sp.get("published") ?? "");
  const [search, setSearch] = useState<string>(sp.get("search") ?? "");

  // Modal state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const returnTo = useMemo(() => `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, [pathname, sp]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const data = await listVehicles({
        status: (status as VehicleStatus) || undefined,
        published: parsePublished(published),
        search: search || undefined
      });
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Error cargando inventario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setStatus(sp.get("status") ?? "");
    setPublished(sp.get("published") ?? "");
    setSearch(sp.get("search") ?? "");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const qs = new URLSearchParams(sp.toString());

    if (search) qs.set("search", search);
    else qs.delete("search");

    if (status) qs.set("status", status);
    else qs.delete("status");

    if (published === "true" || published === "false") qs.set("published", published);
    else qs.delete("published");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    load();
  }

  // Trigger filter application when state changes (debounced or explicit button often better, calling load directly here effectively)
  // For this design, we'll keep the "Filter" button or maybe auto-apply. The original code used a form submit.
  // The design shows dropdowns. Let's make them auto-apply on change for better UX, or keep the button.
  // The plan said "filters card". Let's stick to the form structure but style it.

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("status");
    qs.delete("published");
    qs.delete("search");

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    setStatus("");
    setPublished("");
    setSearch("");
    // load() will be called by useEffect since URL changed? Actually no, standard Next.js behavior might not trigger useEffect if we just pushState.
    // The original code called load() explicitly.
    setTimeout(load, 0);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">Inventario</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventario de Vehículos</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona el catálogo de unidades de tu lote.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => load()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refrescar
            </button>
            <Link
              href={`/inventory/new?returnTo=${encodeURIComponent(returnTo)}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Crear Vehículo
            </Link>
          </div>
        </div>
      </div>

      {err && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{err}</div>}

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters(e); }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Search - Visual only for now as logic wasn't in original, preserving structure */}
          <div className="md:col-span-4 lg:col-span-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Búsqueda rápida</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">directions_car</span>
              </span>
              <input
                type="text"
                placeholder="Buscar por marca, modelo o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer appearance-none"
            >
              <option value="">Todos</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="RESERVED">Reservado</option>
              <option value="SOLD">Vendido</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Publicado</label>
            <select
              value={published}
              onChange={(e) => setPublished(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer appearance-none"
            >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg font-bold text-sm transition-colors"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Marca / Modelo</th>
                <th className="px-6 py-4">Año</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Publicado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{v.title ?? "(Sin título)"}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">{v.publicId || "ID-?"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {(v.brand?.name ?? "-") + " / " + (v.model?.name ?? "-")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{v.year ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-bold">{money(v.price)}</td>
                  <td className="px-6 py-4">
                    {v.status ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status] || "bg-gray-100 text-gray-800"}`}>
                        {v.status === 'AVAILABLE' ? 'Disponible' : v.status === 'RESERVED' ? 'Reservado' : v.status === 'SOLD' ? 'Vendido' : v.status}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {v.isPublished ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/inventory/${v.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Archivar"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("¿Archivar este vehículo?")) return;
                          try {
                            await deleteVehicle(v.id);
                            await load();
                          } catch (e: any) {
                            setErr(e?.message || "No se pudo archivar");
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]">archive</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">no_crash</span>
                      <p>No se encontraron vehículos.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder (as in design) */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {items.length} vehículos</span>
            <div className="flex gap-1">
              <button disabled className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
              <button disabled className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
            </div>
          </div>
        )}

      </div>

      <VehicleDetailsModal
        vehicleId={selectedVehicleId}
        onClose={() => setSelectedVehicleId(null)}
      />
    </div>
  );
}
