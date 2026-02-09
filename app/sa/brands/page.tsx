"use client";

import { useEffect, useState } from "react";
import {
    Brand,
    Model,
    listBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    listModels,
    createModel,
    updateModel,
    deleteModel
} from "@/lib/brands";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    // Brand Management
    const [newBrandName, setNewBrandName] = useState("");
    const [creatingBrand, setCreatingBrand] = useState(false);
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editBrandName, setEditBrandName] = useState("");

    // Model Management
    const [newModelName, setNewModelName] = useState("");
    const [creatingModel, setCreatingModel] = useState(false);
    const [editingModelId, setEditingModelId] = useState<string | null>(null);
    const [editModelName, setEditModelName] = useState("");

    async function loadBrands() {
        setLoadingBrands(true);
        try {
            const data = await listBrands();
            setBrands(data);
        } catch (e: any) {
            setError(e.message || "Error cargando marcas");
        } finally {
            setLoadingBrands(false);
        }
    }

    async function loadModels(brandId: string) {
        setLoadingModels(true);
        try {
            const data = await listModels(brandId);
            setModels(data);
        } catch (e: any) {
            setError(e.message || "Error cargando modelos");
        } finally {
            setLoadingModels(false);
        }
    }

    useEffect(() => {
        loadBrands();
    }, []);

    useEffect(() => {
        if (selectedBrand) {
            loadModels(selectedBrand.id);
        } else {
            setModels([]);
        }
    }, [selectedBrand]);

    // Brand Actions
    async function handleCreateBrand(e: React.FormEvent) {
        e.preventDefault();
        if (!newBrandName.trim()) return;
        setCreatingBrand(true);
        try {
            await createBrand(newBrandName.trim());
            setNewBrandName("");
            loadBrands();
        } catch (e: any) {
            setError(e.message || "Error al crear marca");
        } finally {
            setCreatingBrand(false);
        }
    }

    async function handleUpdateBrand(id: string) {
        if (!editBrandName.trim()) return;
        try {
            await updateBrand(id, editBrandName.trim());
            setEditingBrandId(null);
            loadBrands();
            if (selectedBrand?.id === id) {
                setSelectedBrand({ ...selectedBrand, name: editBrandName.trim() });
            }
        } catch (e: any) {
            setError(e.message || "Error al actualizar marca");
        }
    }

    async function handleDeleteBrand(id: string) {
        if (!confirm("¿Seguro que deseas eliminar esta marca? Se borrarán todos sus modelos asociados.")) return;
        try {
            await deleteBrand(id);
            if (selectedBrand?.id === id) setSelectedBrand(null);
            loadBrands();
        } catch (e: any) {
            setError(e.message || "Error al eliminar marca");
        }
    }

    // Model Actions
    async function handleCreateModel(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedBrand || !newModelName.trim()) return;
        setCreatingModel(true);
        try {
            await createModel(selectedBrand.id, newModelName.trim());
            setNewModelName("");
            loadModels(selectedBrand.id);
        } catch (e: any) {
            setError(e.message || "Error al crear modelo");
        } finally {
            setCreatingModel(false);
        }
    }

    async function handleUpdateModel(id: string) {
        if (!editModelName.trim() || !selectedBrand) return;
        try {
            await updateModel(id, editModelName.trim());
            setEditingModelId(null);
            loadModels(selectedBrand.id);
        } catch (e: any) {
            setError(e.message || "Error al actualizar modelo");
        }
    }

    async function handleDeleteModel(id: string) {
        if (!confirm("¿Seguro que deseas eliminar este modelo?")) return;
        try {
            await deleteModel(id);
            if (selectedBrand) loadModels(selectedBrand.id);
        } catch (e: any) {
            setError(e.message || "Error al eliminar modelo");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Marcas y Modelos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gestión global del catálogo de vehículos.</p>
                </div>
                <button
                    onClick={loadBrands}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className={`material-symbols-outlined ${loadingBrands ? "animate-spin" : ""}`}>refresh</span>
                </button>
            </div>

            {error && (
                <InlineAlert
                    message={error}
                    type="danger"
                    onClose={() => setError(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* BRANDS COLUMN */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Nueva Marca</h3>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreateBrand} className="flex gap-2">
                                <input
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="Ej: Toyota, Honda..."
                                    className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <LoadingButton
                                    loading={creatingBrand}
                                    disabled={!newBrandName.trim()}
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                >
                                    Crear
                                </LoadingButton>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Marcas Registradas</h3>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                                {brands.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {brands.length === 0 && !loadingBrands && (
                                <div className="p-12 text-center text-slate-400 text-sm italic">No hay marcas registradas.</div>
                            )}
                            <ul className="divide-y divide-slate-50 dark:divide-slate-700">
                                {brands.map((b) => (
                                    <li
                                        key={b.id}
                                        onClick={() => setSelectedBrand(b)}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors group ${selectedBrand?.id === b.id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                                    >
                                        <div className="flex-1 mr-4">
                                            {editingBrandId === b.id ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        value={editBrandName}
                                                        onChange={(e) => setEditBrandName(e.target.value)}
                                                        className="flex-1 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-sm py-1 px-2"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateBrand(b.id);
                                                            if (e.key === 'Escape') setEditingBrandId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleUpdateBrand(b.id)} className="text-green-600 hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                                    </button>
                                                    <button onClick={() => setEditingBrandId(null)} className="text-slate-400 hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`text-sm font-bold uppercase tracking-tight ${selectedBrand?.id === b.id ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                    {b.name}
                                                </span>
                                            )}
                                        </div>

                                        {!editingBrandId && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingBrandId(b.id); setEditBrandName(b.name); }}
                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteBrand(b.id); }}
                                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* MODELS COLUMN */}
                <div className="space-y-4">
                    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-opacity ${!selectedBrand ? "opacity-40 pointer-events-none" : ""}`}>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                                {selectedBrand ? `Añadir Modelo a ${selectedBrand.name}` : "Añadir Modelo"}
                            </h3>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreateModel} className="flex gap-2">
                                <input
                                    value={newModelName}
                                    onChange={(e) => setNewModelName(e.target.value)}
                                    placeholder="Ej: Civic, Corolla, Hilux..."
                                    disabled={!selectedBrand}
                                    className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                />
                                <LoadingButton
                                    loading={creatingModel}
                                    disabled={!newModelName.trim() || !selectedBrand}
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                >
                                    Añadir
                                </LoadingButton>
                            </form>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col transition-opacity ${!selectedBrand ? "opacity-40" : ""}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                                {selectedBrand ? `Modelos de ${selectedBrand.name}` : "Selecciona una marca"}
                            </h3>
                            {selectedBrand && (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                                    {models.length}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {!selectedBrand ? (
                                <div className="p-12 text-center text-slate-400 text-sm italic">
                                    Selecciona una marca en la columna de la izquierda para ver sus modelos.
                                </div>
                            ) : models.length === 0 && !loadingModels ? (
                                <div className="p-12 text-center text-slate-400 text-sm italic">No hay modelos para esta marca.</div>
                            ) : (
                                <ul className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {models.map((m) => (
                                        <li
                                            key={m.id}
                                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <div className="flex-1 mr-4">
                                                {editingModelId === m.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={editModelName}
                                                            onChange={(e) => setEditModelName(e.target.value)}
                                                            className="flex-1 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-sm py-1 px-2"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateModel(m.id);
                                                                if (e.key === 'Escape') setEditingModelId(null);
                                                            }}
                                                        />
                                                        <button onClick={() => handleUpdateModel(m.id)} className="text-green-600 hover:scale-110 transition-transform">
                                                            <span className="material-symbols-outlined text-[20px]">check</span>
                                                        </button>
                                                        <button onClick={() => setEditingModelId(null)} className="text-slate-400 hover:scale-110 transition-transform">
                                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                        {m.name}
                                                    </span>
                                                )}
                                            </div>

                                            {!editingModelId && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingModelId(m.id); setEditModelName(m.name); }}
                                                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteModel(m.id)}
                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
