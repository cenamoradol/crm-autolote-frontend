"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConsignor, type ConsignorCreateInput } from "@/lib/consignors";
import { useUser } from "@/components/providers/UserProvider";

function IconArrowLeft({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
}

function IconSave({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-8H7v8" />
            <path d="M7 3v5h8" />
        </svg>
    );
}

export default function NewConsignorPage() {
    const router = useRouter();
    const user = useUser();
    const canCreate = user.isSuperAdmin || (user.permissions || []).includes("consignors:create");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!fullName) return setError("El nombre completo es requerido");

        setSaving(true);
        setError(null);
        try {
            const payload: ConsignorCreateInput = {
                fullName,
                email: email || null,
                phone: phone || null,
                notes: notes || null
            };
            await createConsignor(payload);
            router.push("/consignors");
        } catch (e: any) {
            setError(e.message || "Error al crear consignatario");
        } finally {
            setSaving(false);
        }
    }

    if (!canCreate) { return null; }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <nav className="flex text-sm text-slate-500 mb-2">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    <span className="mx-2">›</span>
                    <Link href="/consignors" className="hover:text-blue-600 transition-colors">Consignatarios</Link>
                    <span className="mx-2">›</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Nuevo</span>
                </nav>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Consignatario</h1>
                    <Link
                        href="/consignors"
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <IconArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ej: Juan Pérez"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                Teléfono / WhatsApp
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="+505 8888 8888"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                Notas Adicionales
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Información relevante sobre el consignatario o sus vehículos..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/consignors"
                            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold transition-all shadow-md active:scale-95"
                        >
                            <IconSave className="w-5 h-5" />
                            {saving ? "Guardando..." : "Guardar Consignatario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
