"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type VehicleType = {
    id: string;
    name: string;
};

export default function VehicleTypesPage() {
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create mode
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createMsg, setCreateMsg] = useState<string | null>(null);

    // Edit mode
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [updating, setUpdating] = useState(false);

    // Delete mode
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch<VehicleType[]>("/vehicle-types");
            setTypes(data);
        } catch (e: any) {
            setError(e.message || "Error al cargar tipos de vehículo");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        setCreateMsg(null);
        try {
            await apiFetch("/vehicle-types", {
                method: "POST",
                body: JSON.stringify({ name: newName }),
            });
            setNewName("");
            setCreateMsg("Tipo creado correctamente ✅");
            load();
        } catch (e: any) {
            setCreateMsg(e.message || "Error al crear");
        } finally {
            setCreating(false);
        }
    }

    function startEdit(t: VehicleType) {
        setEditingId(t.id);
        setEditName(t.name);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName("");
    }

    async function saveEdit(id: string) {
        if (!editName.trim()) return;
        setUpdating(true);
        try {
            await apiFetch(`/vehicle-types/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ name: editName }),
            });
            setEditingId(null);
            load();
        } catch (e: any) {
            setError(e.message || "Error al actualizar");
        } finally {
            setUpdating(false);
        }
    }

    async function deleteType(id: string) {
        if (!confirm("¿Seguro que deseas eliminar este tipo?")) return;
        setDeletingId(id);
        try {
            await apiFetch(`/vehicle-types/${id}`, { method: "DELETE" });
            load();
        } catch (e: any) {
            setError(e.message || "Error al eliminar");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Create Form */}
                <div className="w-full lg:w-[350px] flex-shrink-0 space-y-4">
                    <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nuevo Tipo</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Ej: SUV, Sedán, Pick-up</p>
                                </div>
                            </div>

                            {createMsg && (
                                <div className="mb-4">
                                    <InlineAlert message={createMsg} type={createMsg.includes("✅") ? "success" : "danger"} onClose={() => setCreateMsg(null)} />
                                </div>
                            )}

                            <form onSubmit={onCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Nombre del tipo..."
                                        className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                                <LoadingButton
                                    loading={creating}
                                    disabled={!newName.trim()}
                                    type="submit"
                                    className="w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 focus:outline-none"
                                >
                                    Crear Tipo
                                </LoadingButton>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 min-w-0">
                    <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <div className="border-b border-slate-200 bg-white px-6 py-4 dark:bg-slate-800 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Tipos de Vehículo</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Catálogo para clasificación.</p>
                            </div>
                            <button
                                onClick={load}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="p-4">
                                <InlineAlert message={error} onClose={() => setError(null)} />
                            </div>
                        )}

                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {types.map((t) => (
                                <li key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
                                    {editingId === t.id ? (
                                        <div className="flex items-center gap-2 flex-1 mr-4">
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="block w-full rounded border-slate-300 py-1 text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => saveEdit(t.id)}
                                                disabled={updating}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/30"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                disabled={updating}
                                                className="p-1 text-slate-400 hover:bg-slate-100 rounded dark:hover:bg-slate-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200 uppercase tracking-tight">{t.name}</span>
                                    )}

                                    {!editingId && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(t)}
                                                className="text-xs font-bold text-indigo-600 uppercase tracking-wider hover:underline dark:text-indigo-400"
                                            >
                                                Editar
                                            </button>
                                            <span className="text-slate-300 dark:text-slate-600">|</span>
                                            <button
                                                onClick={() => deleteType(t.id)}
                                                disabled={deletingId === t.id}
                                                className="text-xs font-bold text-red-600 uppercase tracking-wider hover:underline dark:text-red-400"
                                            >
                                                {deletingId === t.id ? "..." : "Eliminar"}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                            {types.length === 0 && !loading && (
                                <li className="p-8 text-center text-sm text-slate-500 uppercase tracking-widest font-medium">
                                    Aún no hay tipos registrados.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
