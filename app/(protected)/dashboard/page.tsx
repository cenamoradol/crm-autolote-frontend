
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

// --- Icons ---
function IconCar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l5 5a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-5-5z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
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

function IconDollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconActivity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}


// --- Components ---

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  subtext?: string;
};

function KpiCard({ title, value, icon: Icon, colorClass, subtext }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {subtext && <span className="text-xs text-gray-400 mt-1">{subtext}</span>}
      </div>
    </div>
  );
}

type Activity = {
  id: string;
  type: string;
  notes: string | null;
  createdAt: string;
  vehicle?: { title: string; stockNumber: string | null };
  customer?: { fullName: string };
  lead?: { fullName: string };
  createdBy?: { fullName: string };
};

type KpiData = {
  available: number;
  reserved: number;
  sold: number;
  leads: number;
  totalSales: number;
};

export default function DashboardPage() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []); // Initial load

  useEffect(() => {
    // Reload when dates change
    if (dateStart || dateEnd) {
      loadData();
    }
  }, [dateStart, dateEnd]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (dateStart) query.set("startDate", dateStart);
      if (dateEnd) query.set("endDate", dateEnd);

      const [kpiData, activityData] = await Promise.all([
        apiFetch<KpiData>(`/dashboard/kpis?${query.toString()}`),
        apiFetch<Activity[]>(`/dashboard/activities`)
      ]);

      setKpis(kpiData);
      setActivities(activityData);

    } catch (e: any) {
      // If unauthorized, backend returns 403 usually.
      if (e.message.includes("403") || e.message.includes("Forbidden")) {
        setError("No tienes permisos para ver el Dashboard. (Solo Admin/SuperAdmin)");
      } else {
        setError(e.message || "Error al cargar datos");
      }
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-500 max-w-sm">{error}</p>
        <Link href="/inventory" className="mt-6 text-blue-600 hover:text-blue-800 font-medium">
          Ir al Inventario
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen general y métricas clave de tu negocio.
          </p>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
            <IconCalendar className="w-4 h-4" />
            <span className="font-medium">Filtrar por fecha:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
            <span className="self-center text-gray-400">-</span>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Disponibles"
          value={loading ? "..." : (kpis?.available ?? 0)}
          icon={IconCar}
          colorClass="bg-blue-600"
          subtext="En inventario actual"
        />
        <KpiCard
          title="Reservados"
          value={loading ? "..." : (kpis?.reserved ?? 0)}
          icon={IconBookmark}
          colorClass="bg-yellow-500"
          subtext="Procesos activos"
        />
        <KpiCard
          title="Vendidos"
          value={loading ? "..." : (kpis?.sold ?? 0)}
          icon={IconTag}
          colorClass="bg-green-600"
          subtext="En el período seleccionado"
        />
        <KpiCard
          title="Leads"
          value={loading ? "..." : (kpis?.leads ?? 0)}
          icon={IconUsers}
          colorClass="bg-purple-600"
          subtext="Nuevos clientes potenciales"
        />
        <KpiCard
          title="Ventas Totales"
          value={loading ? "..." : formatCurrency(kpis?.totalSales ?? 0)}
          icon={IconDollarSign}
          colorClass="bg-emerald-600"
          subtext="Ingresos brutos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <IconActivity className="w-5 h-5 text-gray-400" />
              Actividad Reciente
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Cargando actividades...</div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay actividad reciente.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activities.map(act => (
                  <li key={act.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold uppercase">
                        {act.type.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {act.customer?.fullName ? `Cliente: ${act.customer.fullName}` :
                            act.lead?.fullName ? `Lead: ${act.lead.fullName}` :
                              "Sistema"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {act.notes || "Sin notas"}
                        </p>
                        {act.vehicle && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {act.vehicle.title}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="block text-xs text-gray-400">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Atajos Rápidos</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            <Link
              href="/inventory/new"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors group"
            >
              <div className="bg-blue-100 text-blue-600 p-2 rounded group-hover:bg-blue-200 transition-colors">
                <IconPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 group-hover:text-blue-700">Añadir Vehículo</span>
                <span className="block text-xs text-gray-500">Registrar nuevo ingreso</span>
              </div>
            </Link>

            <Link
              href="/leads"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors group"
            >
              <div className="bg-purple-100 text-purple-600 p-2 rounded group-hover:bg-purple-200 transition-colors">
                <IconUsers className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 group-hover:text-purple-700">Ver Leads</span>
                <span className="block text-xs text-gray-500">Gestionar prospectos</span>
              </div>
            </Link>

            <Link
              href="/sales"
              className="flex items-center gap-3 p-3 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <div className="bg-green-100 text-green-600 p-2 rounded group-hover:bg-green-200 transition-colors">
                <IconDollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 group-hover:text-green-700">Ventas</span>
                <span className="block text-xs text-gray-500">Consultar historial</span>
              </div>
            </Link>
          </div>

          {/* Support Banner (Optional) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Consulta nuestra documentación o contacta a soporte técnico.
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded font-bold text-sm hover:bg-blue-50 transition-colors w-full">
              Abrir Ticket
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
