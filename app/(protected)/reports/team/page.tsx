"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/providers/UserProvider";

function IconBarChart({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    );
}

function IconRefresh({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
        </svg>
    );
}

async function fetchJson(url: string) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export default function TeamReportsPage() {
    const user = useUser();
    const canSeeReports = user.isSuperAdmin || (user.permissions || []).includes("reports:read");

    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [period, setPeriod] = useState("all-time");

    async function load() {
        if (!canSeeReports) return;
        setLoading(true);
        setError(null);
        try {
            let query = "";
            if (period === "this-month") {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                query = `?startDate=${start.toISOString()}`;
            } else if (period === "last-7-days") {
                const start = new Date();
                start.setDate(start.getDate() - 7);
                query = `?startDate=${start.toISOString()}`;
            }

            const data = await fetchJson(`/api/bff/dashboard/team-kpis${query}`);
            setStats(Array.isArray(data) ? data : data.data || []);
        } catch (e: any) {
            setError(e.message || "Error al cargar reportes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, canSeeReports]);

    if (!canSeeReports) {
        return <div className="p-8 text-center text-red-500 font-bold">No tienes permiso para ver esta sección.</div>;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div>
                <nav className="flex text-sm text-slate-500 mb-2">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    <span className="mx-2">›</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Rendimiento del Equipo</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconBarChart className="w-7 h-7 text-indigo-600" />
                            Reportes y KPIs
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Indicadores clave de rendimiento por cada miembro del equipo.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all-time">Todo el historial</option>
                            <option value="this-month">Este Mes</option>
                            <option value="last-7-days">Últimos 7 días</option>
                        </select>
                        <button
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
                        >
                            <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">{error}</div>}

            {/* Table Leaderboard */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4 text-center">Vehículos Añadidos</th>
                                <th className="px-6 py-4 text-center">Vehículos Vendidos</th>
                                <th className="px-6 py-4 text-center">Actividades Registradas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats.length > 0 ? (
                                stats.map((row) => (
                                    <tr key={row.user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {row.user.fullName?.substring(0, 2).toUpperCase() || row.user.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{row.user.fullName}</div>
                                                    <div className="text-xs text-slate-400 truncate">{row.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{row.metrics.vehiclesCreated}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{row.metrics.vehiclesSold}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{row.metrics.activitiesLogged}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No hay datos de rendimiento disponibles de tu equipo para las fechas seleccionadas.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
