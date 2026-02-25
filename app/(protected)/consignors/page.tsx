"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listConsignors, getConsignor, deleteConsignor, type Consignor } from "@/lib/consignors";
import { useUser } from "@/components/providers/UserProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- Icons ---
function IconSearch({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function IconPlus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
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

function IconUser({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconEdit({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
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

function IconClose({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

function IconMail({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

export default function ConsignorsPage() {
    const user = useUser();
    const router = useRouter();
    const canEdit = user.isSuperAdmin || (user.permissions || []).includes("consignors:update");

    const [items, setItems] = useState<Consignor[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // RBAC Client side protection (Server side also exists via Layout/Middleware but good to have here)
    useEffect(() => {
        if (!canEdit) {
            router.replace("/dashboard");
        }
    }, [canEdit, router]);

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            const res = await listConsignors(q);
            setItems(res);
        } catch (e: any) {
            setErr(e.message || "Error cargando consignatarios");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canEdit) {
            load();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canEdit]);

    // Handle Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (canEdit) load();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    async function handleDelete(id: string, name: string) {
        if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
        try {
            await deleteConsignor(id);
            toast.success("Consignatario eliminado");
            load();
        } catch (e: any) {
            toast.error(e.message || "Error al eliminar");
        }
    }

    if (!canEdit) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <nav className="flex text-sm text-slate-500 mb-2">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    <span className="mx-2">›</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Consignatarios</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Consignatarios</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Dueños de vehículos que dejan sus unidades para venta.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => load()}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                        >
                            <IconRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Refrescar
                        </button>
                        <Link
                            href="/consignors/new"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md"
                        >
                            <IconPlus className="w-5 h-5" />
                            Nuevo Consignatario
                        </Link>
                    </div>
                </div>
            </div>

            {err && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{err}</div>}

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                <div className="relative max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconSearch className="w-5 h-5 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow placeholder-slate-400"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Consignatario</th>
                                <th className="px-6 py-4">Información de Contacto</th>
                                <th className="px-6 py-4">Notas</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map((c) => (
                                <tr
                                    key={c.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedId(c.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {c.fullName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">{c.fullName}</div>
                                                <div className="text-xs text-slate-400">Registrado: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                                            {canEdit && (
                                                <div className="flex items-center gap-1.5 ">
                                                    <IconMail className="w-4 h-4 text-slate-400" />
                                                    {c.email}
                                                </div>
                                            )}
                                            {c.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <IconPhone className="w-4 h-4 text-slate-400" />
                                                    {c.phone}
                                                </div>
                                            )}
                                            {!canEdit && !c.phone && <span className="text-slate-400 italic text-xs">Sin contacto</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-sm text-slate-500">
                                        {c.notes || <span className="text-slate-400 italic">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                        <Link
                                            href={`/consignors/${c.id}`}
                                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <IconEdit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(c.id, c.fullName)}
                                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <IconUser className="w-12 h-12 text-slate-300 mb-2" />
                                            <p>No se encontraron consignatarios.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Drawer Overlay */}
            {selectedId && (
                <ConsignorDetailDrawer
                    id={selectedId}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </div>
    );
}

function ConsignorDetailDrawer({ id, onClose }: { id: string, onClose: () => void }) {
    const [consignor, setConsignor] = useState<Consignor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getConsignor(id);
                setConsignor(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full">
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                            {consignor?.fullName.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                                {loading ? 'Cargando...' : consignor?.fullName}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Detalles del Consignatario</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
                    >
                        <IconClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <IconRefresh className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-slate-500 text-sm">Cargando información...</p>
                        </div>
                    ) : consignor && (
                        <>
                            {/* Contact Info Section */}
                            <section className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información de Contacto</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600">
                                            <IconMail className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Correo Electrónico</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{consignor.email || 'No registrado'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-green-600">
                                            <IconPhone className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Teléfono Movil</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{consignor.phone || 'No registrado'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Vehicles Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Vehículos Consignados
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                                            {consignor.vehicles?.length || 0}
                                        </span>
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {consignor.vehicles && consignor.vehicles.length > 0 ? (
                                        consignor.vehicles.map((v: any) => (
                                            <Link
                                                key={v.id}
                                                href={`/inventory/${v.id}`}
                                                className="block p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                                        <IconCar className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                                            {v.year} {v.brand?.name} {v.model?.name}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                                                                VIN: {v.vin?.substring(0, 8)}...
                                                            </span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${v.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400'
                                                                }`}>
                                                                {v.status === 'AVAILABLE' ? 'Disponible' : v.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <IconCar className="w-8 h-8 text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400">Sin vehículos en consignación.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Notes Section */}
                            {consignor.notes && (
                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center flex items-center gap-2">
                                        <span className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></span>
                                        Notas Adicionales
                                        <span className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></span>
                                    </h3>
                                    <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                                        "{consignor.notes}"
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
                    <Link
                        href={`/consignors/${consignor?.id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <IconEdit className="w-4 h-4" />
                        Editar Perfil Completo
                    </Link>
                </div>
            </div>
        </div>
    );
}
