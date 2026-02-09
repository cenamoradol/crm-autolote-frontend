"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { listActivities, type Activity, type ActivityListMeta, type ActivityType } from "@/lib/activities";
import { InlineAlert } from "@/components/ui/InlineAlert";

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
function IconRefesh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
function IconEdit({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

// Activity Types Config
const TYPE_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  CALL: { label: "LLAMADA", color: "bg-blue-100 text-blue-800", icon: IconPhone },
  WHATSAPP: { label: "WHATSAPP", color: "bg-green-100 text-green-800", icon: IconMessageCircle },
  EMAIL: { label: "EMAIL", color: "bg-cyan-100 text-cyan-800", icon: IconMail },
  MEETING: { label: "REUNIÓN", color: "bg-purple-100 text-purple-800", icon: IconUsers },
  NOTE: { label: "NOTA", color: "bg-gray-100 text-gray-800", icon: IconStickyNote },
  SYSTEM: { label: "SISTEMA", color: "bg-red-100 text-red-800", icon: IconSystem },
}

function IconPhone({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
}
function IconMessageCircle({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
}
function IconMail({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
}
function IconUsers({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function IconStickyNote({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" /><path d="M15 3v5h5" /></svg>
}
function IconSystem({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
}

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    if (d.startsWith("http://") || d.startsWith("https://")) return null; // Simple safety check
    return d;
  } catch {
    return null;
  }
}

const ACTIVITY_TYPES: ActivityType[] = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE", "SYSTEM"];

function isActivityType(v: string): v is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(v);
}

export default function ActivitiesPage() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  const leadId = sp.get("leadId") ?? "";
  const customerId = sp.get("customerId") ?? "";
  const vehicleId = sp.get("vehicleId") ?? "";

  const backTo = useMemo(() => {
    const rt = safeDecode(sp.get("returnTo"));
    if (rt && !rt.startsWith("/activities")) return rt;
    const bt = safeDecode(sp.get("backTo"));
    if (bt && !bt.startsWith("/activities")) return bt;
    return null;
  }, [sp]);

  const listUrl = useMemo(() => {
    const qs = sp.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sp]);

  const createHref = useMemo(() => {
    const qs = new URLSearchParams(sp.toString());
    qs.set("returnTo", listUrl);
    return `/activities/new?${qs.toString()}`;
  }, [sp, listUrl]);

  const [items, setItems] = useState<Activity[]>([]);
  const [meta, setMeta] = useState<ActivityListMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [type, setType] = useState<ActivityType | "">(() => {
    const t = sp.get("type") ?? "";
    return t && isActivityType(t) ? t : "";
  });
  const [createdFrom, setCreatedFrom] = useState(sp.get("createdFrom") ?? "");
  const [createdTo, setCreatedTo] = useState(sp.get("createdTo") ?? "");

  const canFilter = useMemo(() => q.trim().length === 0 || q.trim().length >= 2, [q]);

  async function load(page: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listActivities({
        page,
        limit: meta.limit,
        q: q.trim().length >= 2 ? q.trim() : undefined,
        type: type ? type : undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        leadId: leadId || undefined,
        customerId: customerId || undefined,
        vehicleId: vehicleId || undefined,
        sortBy: "createdAt",
        sortDir: "desc"
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e?.message || "Error cargando actividades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    const t = sp.get("type") ?? "";
    setType(t && isActivityType(t) ? t : "");
    setCreatedFrom(sp.get("createdFrom") ?? "");
    setCreatedTo(sp.get("createdTo") ?? "");
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canFilter) return;

    const qs = new URLSearchParams(sp.toString());
    if (q.trim().length >= 2) qs.set("q", q.trim()); else qs.delete("q");
    if (type) qs.set("type", type); else qs.delete("type");
    if (createdFrom) qs.set("createdFrom", createdFrom); else qs.delete("createdFrom");
    if (createdTo) qs.set("createdTo", createdTo); else qs.delete("createdTo");

    if (backTo) {
      if (sp.get("returnTo")) qs.set("returnTo", sp.get("returnTo")!);
      if (sp.get("backTo")) qs.set("backTo", sp.get("backTo")!);
    }

    // Preserve context
    if (leadId) qs.set("leadId", leadId);
    if (customerId) qs.set("customerId", customerId);
    if (vehicleId) qs.set("vehicleId", vehicleId);

    const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    router.replace(nextUrl);
  }

  function clearFilters() {
    const qs = new URLSearchParams(sp.toString());
    qs.delete("q"); qs.delete("type"); qs.delete("createdFrom"); qs.delete("createdTo");
    router.replace(`${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`);
    setQ(""); setType(""); setCreatedFrom(""); setCreatedTo("");
  }

  // Styling Helpers
  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm";
  const selectClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Actividades</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Actividades</h1>
            </div>

            <div className="flex gap-3">
              {backTo && (
                <Link
                  href={backTo}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <IconArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Link>
              )}
              <button
                onClick={() => load(meta.page)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <IconRefesh className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando..." : "Refrescar"}
              </button>
              <Link
                href={createHref}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Registrar actividad
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {err && <div className="mb-6"><InlineAlert type="danger" message={err} onClose={() => setErr(null)} /></div>}

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <label className={labelClass}>BUSCAR</label>
              <div className="relative">
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Buscar en notas..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>TIPO</label>
              <select className={selectClass} value={type} onChange={e => setType(e.target.value as ActivityType)}>
                <option value="">Todos</option>
                {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>DESDE</label>
              <input
                type="date"
                className={inputClass}
                value={createdFrom}
                onChange={e => setCreatedFrom(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>HASTA</label>
              <input
                type="date"
                className={inputClass}
                value={createdTo}
                onChange={e => setCreatedTo(e.target.value)}
              />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <button
                type="submit"
                className={`w-full inline-flex justify-center items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${!canFilter ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!canFilter}
              >
                <IconFilter className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="hidden md:block md:col-span-2">TIPO</div>
            <div className="col-span-8 md:col-span-5">NOTAS</div>
            <div className="hidden md:block md:col-span-3">CONTEXTO</div>
            <div className="col-span-4 md:col-span-2 text-right">CREADO / ACCIONES</div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading && items.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Cargando actividades...</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No se encontraron actividades.</div>
            ) : (
              items.map((act) => {
                const conf = TYPE_CONFIG[act.type] || TYPE_CONFIG.NOTE;
                const Icon = conf.icon;
                return (
                  <div key={act.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">

                    {/* Type */}
                    <div className="hidden md:flex md:col-span-2 items-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${conf.color}`}>
                        <Icon className="w-3.5 h-3.5 mr-1" />
                        {conf.label}
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="col-span-12 md:col-span-5">
                      <div className="md:hidden mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${conf.color}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {conf.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{act.notes || "Sin notas"}</p>
                      {(act.notes?.length || 0) > 100 && (
                        <button className="text-xs text-blue-600 hover:underline mt-1">Ver más</button>
                      )}
                    </div>

                    {/* Context */}
                    <div className="col-span-12 md:col-span-3 flex flex-wrap gap-2">
                      {act.lead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Lead: {act.lead.fullName || "Lead"}
                        </span>
                      )}
                      {act.customer && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                          Cliente: {act.customer.fullName || "Cliente"}
                        </span>
                      )}
                      {act.vehicle && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-100">
                          Vehículo: {act.vehicle.title || "Vehículo"}
                        </span>
                      )}
                      {!act.lead && !act.customer && !act.vehicle && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                          Sistema
                        </span>
                      )}
                    </div>

                    {/* Created / Actions */}
                    <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </div>
                      </div>
                      <Link
                        href={`/activities/${act.id}?returnTo=${encodeURIComponent(listUrl)}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      >
                        <IconEdit className="w-5 h-5" />
                      </Link>
                    </div>

                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {items.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} a {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} actividades
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
