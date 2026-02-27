"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getCustomerDetail, addCustomerPreference, removeCustomerPreference,
    toggleCustomerPreference, addCustomerActivity, updateCustomerStatus,
    getMatchingVehicles,
    type CustomerDetail, type CustomerPreference, type CustomerActivity, type MatchingVehicle,
} from "@/lib/customers";
import { listBrands, listModelsByBrand, type Brand, type Model } from "@/lib/catalog";
import { useUser } from "@/components/providers/UserProvider";

// ── Status Config ──
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: "Activo", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    CONTACTED: { label: "Contactado", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    NO_RESPONSE: { label: "Sin Respuesta", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    NOT_INTERESTED: { label: "No Interesado", color: "text-red-700", bg: "bg-red-50 border-red-200" },
    PURCHASED: { label: "Compró", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
    CALL: { icon: "📞", color: "bg-green-100 text-green-700" },
    WHATSAPP: { icon: "💬", color: "bg-emerald-100 text-emerald-700" },
    EMAIL: { icon: "📧", color: "bg-blue-100 text-blue-700" },
    MEETING: { icon: "🤝", color: "bg-purple-100 text-purple-700" },
    NOTE: { icon: "📝", color: "bg-slate-100 text-slate-700" },
    SYSTEM: { icon: "⚙️", color: "bg-slate-50 text-slate-400" },
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const user = useUser();

    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [matches, setMatches] = useState<MatchingVehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Preference form
    const [showPrefForm, setShowPrefForm] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [prefBrand, setPrefBrand] = useState("");
    const [prefModel, setPrefModel] = useState("");
    const [prefYearFrom, setPrefYearFrom] = useState("");
    const [prefYearTo, setPrefYearTo] = useState("");
    const [prefNotes, setPrefNotes] = useState("");
    const [savingPref, setSavingPref] = useState(false);

    // Activity form
    const [showActForm, setShowActForm] = useState(false);
    const [actType, setActType] = useState("CALL");
    const [actNotes, setActNotes] = useState("");
    const [savingAct, setSavingAct] = useState(false);

    // Status
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    async function load() {
        try {
            const [c, m] = await Promise.all([
                getCustomerDetail(id),
                getMatchingVehicles(id),
            ]);
            setCustomer(c);
            setMatches(m);
        } catch (err: any) {
            toast.error(err.message || "Error al cargar cliente");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [id]);

    useEffect(() => {
        listBrands().then(setBrands).catch(() => { });
    }, []);

    useEffect(() => {
        if (prefBrand) {
            listModelsByBrand(prefBrand).then(setModels).catch(() => { });
        } else {
            setModels([]);
        }
        setPrefModel("");
    }, [prefBrand]);

    // Handlers

    async function handleAddPreference(e: React.FormEvent) {
        e.preventDefault();
        if (!prefBrand) return toast.error("Selecciona una marca");
        setSavingPref(true);
        try {
            await addCustomerPreference(id, {
                brandId: prefBrand || undefined,
                modelId: prefModel || undefined,
                yearFrom: prefYearFrom ? Number(prefYearFrom) : undefined,
                yearTo: prefYearTo ? Number(prefYearTo) : undefined,
                notes: prefNotes || undefined,
            });
            toast.success("Preferencia agregada");
            setShowPrefForm(false);
            setPrefBrand(""); setPrefModel(""); setPrefYearFrom(""); setPrefYearTo(""); setPrefNotes("");
            load();
        } catch (err: any) {
            toast.error(err.message || "Error al agregar preferencia");
        } finally {
            setSavingPref(false);
        }
    }

    async function handleTogglePref(prefId: string) {
        try {
            await toggleCustomerPreference(id, prefId);
            load();
        } catch (err: any) {
            toast.error(err.message || "Error");
        }
    }

    async function handleRemovePref(prefId: string) {
        if (!confirm("¿Eliminar esta preferencia?")) return;
        try {
            await removeCustomerPreference(id, prefId);
            toast.success("Preferencia eliminada");
            load();
        } catch (err: any) {
            toast.error(err.message || "Error");
        }
    }

    async function handleAddActivity(e: React.FormEvent) {
        e.preventDefault();
        if (!actNotes.trim()) return toast.error("Agrega una nota");
        setSavingAct(true);
        try {
            await addCustomerActivity(id, { type: actType, notes: actNotes.trim() });
            toast.success("Actividad registrada");
            setShowActForm(false);
            setActNotes("");
            load();
        } catch (err: any) {
            toast.error(err.message || "Error al registrar actividad");
        } finally {
            setSavingAct(false);
        }
    }

    async function handleStatusChange(status: string) {
        setShowStatusMenu(false);
        try {
            await updateCustomerStatus(id, status);
            toast.success("Estado actualizado");
            load();
        } catch (err: any) {
            toast.error(err.message || "Error");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20 text-slate-500">
                <p className="text-lg">Cliente no encontrado</p>
                <Link href="/customers" className="text-blue-600 underline mt-2 inline-block">Volver a Clientes</Link>
            </div>
        );
    }

    const st = STATUS_MAP[customer.status || "ACTIVE"] || STATUS_MAP.ACTIVE;

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div>
                <Link href="/customers" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-3">
                    <span>←</span> Volver a Clientes
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shrink-0">
                                {customer.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{customer.fullName}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                                    {customer.phone && <span>📱 {customer.phone}</span>}
                                    {customer.email && <span>✉️ {customer.email}</span>}
                                    {customer.documentId && <span>🪪 {customer.documentId}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Status Badge + Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all ${st.bg} ${st.color}`}
                            >
                                {st.label}
                                <span className="text-xs">▼</span>
                            </button>
                            {showStatusMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleStatusChange(key)}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${customer.status === key ? "bg-slate-50 dark:bg-slate-700" : ""}`}
                                        >
                                            <span className={val.color}>{val.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (2/3) — Preferences + Matches */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Preferences */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Preferencias de Vehículos</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Vehículos que le interesan al cliente</p>
                            </div>
                            <button
                                onClick={() => setShowPrefForm(!showPrefForm)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors"
                            >
                                + Agregar
                            </button>
                        </div>

                        {/* Add Preference Form */}
                        {showPrefForm && (
                            <form onSubmit={handleAddPreference} className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
                                        <select value={prefBrand} onChange={e => setPrefBrand(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
                                            <option value="">Seleccionar...</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Modelo</label>
                                        <select value={prefModel} onChange={e => setPrefModel(e.target.value)} disabled={!prefBrand}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white disabled:opacity-50">
                                            <option value="">Todos los modelos</option>
                                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Año Desde</label>
                                        <input type="number" value={prefYearFrom} onChange={e => setPrefYearFrom(e.target.value)} placeholder="2010"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Año Hasta</label>
                                        <input type="number" value={prefYearTo} onChange={e => setPrefYearTo(e.target.value)} placeholder="2015"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notas</label>
                                    <input type="text" value={prefNotes} onChange={e => setPrefNotes(e.target.value)} placeholder="Ej: Color negro preferido"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={savingPref}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                                        {savingPref ? "Guardando..." : "Guardar"}
                                    </button>
                                    <button type="button" onClick={() => setShowPrefForm(false)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Preferences List */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {customer.preferences.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">
                                    No hay preferencias registradas
                                </div>
                            ) : customer.preferences.map(pref => (
                                <div key={pref.id} className={`p-4 flex items-center justify-between gap-4 ${!pref.isActive ? "opacity-50" : ""}`}>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-slate-800 dark:text-white">
                                                {pref.brand?.name || "Cualquier marca"}
                                            </span>
                                            {pref.model && (
                                                <span className="text-sm text-slate-500">/ {pref.model.name}</span>
                                            )}
                                            {(pref.yearFrom || pref.yearTo) && (
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                                    {pref.yearFrom || "?"} - {pref.yearTo || "?"}
                                                </span>
                                            )}
                                            {!pref.isActive && (
                                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">Inactiva</span>
                                            )}
                                        </div>
                                        {pref.notes && (
                                            <p className="text-xs text-slate-400 mt-1 truncate">{pref.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => handleTogglePref(pref.id)} title={pref.isActive ? "Desactivar" : "Activar"}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                                            {pref.isActive ? "⏸" : "▶️"}
                                        </button>
                                        <button onClick={() => handleRemovePref(pref.id)} title="Eliminar"
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors text-sm">
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Purchased Vehicles */}
                    {customer.sales?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900 overflow-hidden mb-6 shadow-sm">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 border-b border-indigo-100 dark:border-indigo-800">
                                <h2 className="font-black text-indigo-900 dark:text-indigo-100 text-sm flex items-center gap-2">
                                    <span className="text-lg">🎉</span> Vehículos Comprados
                                </h2>
                                <p className="text-xs text-indigo-600/70 dark:text-indigo-300 mt-0.5">Historial de compras concretadas por este cliente</p>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {customer.sales.map(s => (
                                    <Link key={s.id} href={`/sales/${s.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="w-20 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                                            {s.vehicle.media?.[0]?.url ? (
                                                <img src={s.vehicle.media[0].url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl">🚗</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                {s.vehicle.brand?.name} {s.vehicle.model?.name} {s.vehicle.year || ""}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                ID: {s.vehicle.publicId}
                                                {s.soldAt ? ` • Comprado el ${new Date(s.soldAt).toLocaleDateString()}` : ""}
                                            </p>
                                        </div>
                                        {s.soldPrice && (
                                            <span className="text-sm font-black text-indigo-600 shrink-0">
                                                ${Number(s.soldPrice).toLocaleString()}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matching Vehicles */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-bold text-slate-800 dark:text-white text-sm">🚗 Vehículos Disponibles que Coinciden</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Basado en las preferencias activas del cliente</p>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {matches.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">
                                    No hay vehículos disponibles que coincidan
                                </div>
                            ) : matches.map(v => (
                                <Link key={v.id} href={`/inventory/${v.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                                        {v.media?.[0]?.url ? (
                                            <img src={v.media[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">🚗</div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                            {v.brand?.name} {v.model?.name} {v.year || ""}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            ID: {v.publicId}
                                            {v.mileage ? ` • ${Number(v.mileage).toLocaleString()} km` : ""}
                                        </p>
                                    </div>
                                    {v.price && (
                                        <span className="text-sm font-black text-emerald-600 shrink-0">
                                            ${Number(v.price).toLocaleString()}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) — Activities */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Historial de Seguimiento</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Acciones realizadas</p>
                            </div>
                            <button
                                onClick={() => setShowActForm(!showActForm)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                                + Registrar
                            </button>
                        </div>

                        {/* Add Activity Form */}
                        {showActForm && (
                            <form onSubmit={handleAddActivity} className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { key: "CALL", label: "📞 Llamada" },
                                            { key: "WHATSAPP", label: "💬 WhatsApp" },
                                            { key: "EMAIL", label: "📧 Email" },
                                            { key: "MEETING", label: "🤝 Reunión" },
                                            { key: "NOTE", label: "📝 Nota" },
                                        ].map(t => (
                                            <button key={t.key} type="button" onClick={() => setActType(t.key)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${actType === t.key
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                                    }`}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nota</label>
                                    <textarea value={actNotes} onChange={e => setActNotes(e.target.value)} rows={3}
                                        placeholder="Ej: Se llamó al cliente, dijo que aún le interesa..."
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white resize-none" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={savingAct}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                                        {savingAct ? "Guardando..." : "Registrar"}
                                    </button>
                                    <button type="button" onClick={() => setShowActForm(false)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Activities Timeline */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {customer.activities.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">
                                    No hay actividades registradas
                                </div>
                            ) : customer.activities.map(act => {
                                const ai = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.NOTE;
                                return (
                                    <div key={act.id} className="p-4 flex gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${ai.color}`}>
                                            {ai.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                                                    {act.type === "WHATSAPP" ? "WhatsApp" : act.type === "CALL" ? "Llamada" : act.type === "EMAIL" ? "Email" : act.type === "MEETING" ? "Reunión" : act.type === "NOTE" ? "Nota" : "Sistema"}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {act.createdAt ? new Date(act.createdAt).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                                </span>
                                            </div>
                                            {act.notes && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{act.notes}</p>
                                            )}
                                            {act.createdBy?.fullName && (
                                                <p className="text-[10px] text-slate-400 mt-1">por {act.createdBy.fullName}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
