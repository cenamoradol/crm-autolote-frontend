"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { toast } from "react-hot-toast";

type Plan = {
    id: string;
    code: string;
    name: string;
    priceMonthly: string;
    currency: string;
    isActive: boolean;
    features: any;
    createdAt: string;
};

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        code: "",
        name: "",
        priceMonthly: 0,
        currency: "USD",
        isActive: true,
    });

    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch<Plan[]>("/sa/plans");
            setPlans(data);
        } catch (e: any) {
            toast.error(e.message || "Error cargando planes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function onEdit(plan: Plan) {
        setEditingPlan(plan);
        setForm({
            code: plan.code,
            name: plan.name,
            priceMonthly: parseFloat(plan.priceMonthly),
            currency: plan.currency,
            isActive: plan.isActive,
        });
        setShowModal(true);
    }

    function onNew() {
        setEditingPlan(null);
        setForm({
            code: "",
            name: "",
            priceMonthly: 0,
            currency: "USD",
            isActive: true,
        });
        setShowModal(true);
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingPlan) {
                await apiFetch(`/sa/plans/${editingPlan.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(form),
                });
                toast.success("Plan actualizado");
            } else {
                await apiFetch("/sa/plans", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
                toast.success("Plan creado");
            }
            setShowModal(false);
            load();
        } catch (e: any) {
            toast.error(e.message || "Error guardando plan");
        } finally {
            setSaving(false);
        }
    }

    async function onDelete(id: string) {
        if (!confirm("¿Estás seguro de eliminar este plan? Si está en uso, solo se desactivará.")) return;
        try {
            await apiFetch(`/sa/plans/${id}`, { method: "DELETE" });
            toast.success("Operación exitosa");
            load();
        } catch (e: any) {
            toast.error(e.message || "Error eliminando plan");
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Planes</h1>
                    <p className="text-sm text-slate-500">Configura tus suscripciones tipo Netflix/Spotify</p>
                </div>
                <button
                    onClick={onNew}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none"
                >
                    Nuevo Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="col-span-full text-center py-10 text-slate-500 animate-pulse">Cargando planes...</p>
                ) : plans.length === 0 ? (
                    <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500">No hay planes configurados todavía.</p>
                    </div>
                ) : (
                    plans.map((p) => (
                        <div key={p.id} className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-800 ${p.isActive ? "border-slate-200 dark:border-slate-700" : "border-red-100 bg-red-50/30 grayscale dark:border-red-900/30"}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.code}</span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                                </div>
                                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${p.isActive ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                                    {p.isActive ? "ACTIVO" : "INACTIVO"}
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{p.currency} {p.priceMonthly}</span>
                                <span className="text-slate-500 font-medium ml-1">/mes</span>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => onEdit(p)}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(p.id)}
                                    className="flex-1 rounded-lg border border-transparent px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {editingPlan ? "Editar Plan" : "Nuevo Plan"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Código</label>
                                    <input
                                        required
                                        placeholder="Ex: BASIC_MONTH"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value })}
                                        disabled={!!editingPlan}
                                        className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Moneda</label>
                                    <input
                                        required
                                        placeholder="USD"
                                        value={form.currency}
                                        onChange={e => setForm({ ...form, currency: e.target.value })}
                                        className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                                <input
                                    required
                                    placeholder="Plan Básico"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Precio Mensual</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={form.priceMonthly}
                                    onChange={e => setForm({ ...form, priceMonthly: parseFloat(e.target.value) })}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan Activo</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    Cancelar
                                </button>
                                <LoadingButton loading={saving} className="flex-1 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none" type="submit">
                                    {editingPlan ? "Actualizar" : "Crear Plan"}
                                </LoadingButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
