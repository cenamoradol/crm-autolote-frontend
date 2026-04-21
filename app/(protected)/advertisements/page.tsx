"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Advertisement,
    listAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
} from "@/lib/advertisements";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function AdvertisementsPage() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form
    const [isCreating, setIsCreating] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        targetUrl: "",
        placement: "VEHICLE_LIST" as "HERO" | "VEHICLE_LIST" | "FLOATING_BOTTOM",
        isActive: true,
        position: 0,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function loadAds() {
        setLoading(true);
        try {
            const data = await listAdvertisements();
            setAds(data);
        } catch (e: any) {
            setError(e.message || "Error cargando anuncios");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAds();
    }, []);

    function handleEdit(ad: Advertisement) {
        setEditingAd(ad);
        setIsCreating(false);
        setFormData({
            title: ad.title || "",
            targetUrl: ad.targetUrl || "",
            placement: ad.placement,
            isActive: ad.isActive,
            position: ad.position,
        });
        setSelectedFile(null);
        setPreviewUrl(ad.imageUrl);
    }

    function handleStartCreate() {
        setEditingAd(null);
        setIsCreating(true);
        setFormData({
            title: "",
            targetUrl: "",
            placement: "VEHICLE_LIST",
            isActive: true,
            position: 0,
        });
        setSelectedFile(null);
        setPreviewUrl(null);
    }

    function cancelForm() {
        setIsCreating(false);
        setEditingAd(null);
        setSelectedFile(null);
        setPreviewUrl(null);
    }

    const handleFileSelect = useCallback((file: File) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            setError("Solo se permiten archivos de imagen (JPG, PNG, GIF) o video (MP4, MOV).");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("El archivo no puede superar 10MB.");
            return;
        }
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!editingAd && !selectedFile) {
            setError("Debes seleccionar una imagen para el anuncio.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const fd = new FormData();
            if (selectedFile) fd.append("file", selectedFile);
            if (formData.title) fd.append("title", formData.title);
            if (formData.targetUrl) fd.append("targetUrl", formData.targetUrl);
            fd.append("placement", formData.placement);
            fd.append("isActive", String(formData.isActive));
            fd.append("position", String(formData.position));

            if (editingAd) {
                await updateAdvertisement(editingAd.id, fd);
            } else {
                await createAdvertisement(fd);
            }

            cancelForm();
            loadAds();
        } catch (e: any) {
            setError(e.message || "Error guardando el anuncio");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Seguro que deseas eliminar este anuncio?")) return;
        try {
            await deleteAdvertisement(id);
            loadAds();
        } catch (e: any) {
            setError(e.message || "Error al eliminar anuncio");
        }
    }

    async function handleToggleActive(ad: Advertisement) {
        try {
            const fd = new FormData();
            fd.append("isActive", String(!ad.isActive));
            fd.append("placement", ad.placement);
            await updateAdvertisement(ad.id, fd);
            loadAds();
        } catch (e: any) {
            setError(e.message || "Error al cambiar estado");
        }
    }

    const placementLabels: Record<string, string> = {
        HERO: "Hero Slider",
        VEHICLE_LIST: "Catálogo",
        FLOATING_BOTTOM: "Banner Flotante"
    };

    const placementColors: Record<string, string> = {
        HERO: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
        VEHICLE_LIST: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        FLOATING_BOTTOM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Publicidad</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Administra los banners del sitio web público.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAds}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <span className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}>refresh</span>
                    </button>
                    {!isCreating && !editingAd && (
                        <button
                            onClick={handleStartCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Nuevo Anuncio
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <InlineAlert
                    message={error}
                    type="danger"
                    onClose={() => setError(null)}
                />
            )}

            {/* ────────────────── FORMULARIO ────────────────── */}
            {(isCreating || editingAd) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                            {editingAd ? "Editar Anuncio" : "Nuevo Anuncio"}
                        </h3>
                        <button onClick={cancelForm} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Drag & Drop Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                Imagen del Banner {!editingAd && "*"}
                            </label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${isDragging
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : previewUrl
                                            ? "border-slate-200 dark:border-slate-700"
                                            : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900"
                                    }`}
                            >
                                {previewUrl ? (
                                    <div className="relative group">
                                        {selectedFile?.type.startsWith("video/") || editingAd?.kind === "VIDEO" ? (
                                            <video
                                                src={previewUrl}
                                                className="w-full h-48 object-contain bg-slate-100 dark:bg-slate-900"
                                                autoPlay
                                                muted
                                                loop
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Vista previa"
                                                className="w-full h-48 object-contain bg-slate-100 dark:bg-slate-900"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                                                Cambiar archivo
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 px-4">
                                        <span className="material-symbols-outlined text-[40px] text-slate-400 mb-3">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Arrastra tu archivo aquí
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            o haz clic para seleccionar · Imagen o Video · Máx 10MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Título (Interno)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ej: Promo Verano 2026"
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Enlace Destino</label>
                                <input
                                    type="url"
                                    value={formData.targetUrl}
                                    onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                                    placeholder="https://wa.me/50412345678"
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <span className="text-[10px] text-slate-500">WhatsApp, sitio web, o cualquier URL donde quieras dirigir al visitante.</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Ubicación</label>
                                <select
                                    value={formData.placement}
                                    onChange={e => setFormData({ ...formData, placement: e.target.value as any })}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="HERO">🖼️ Hero Slider (Portada principal)</option>
                                    <option value="VEHICLE_LIST">📋 Catálogo de Vehículos (Entre tarjetas)</option>
                                    <option value="FLOATING_BOTTOM">🪧 Banner Flotante (Aparece después de 20s)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Orden / Posición</label>
                                <input
                                    type="number"
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Anuncio Activo</span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors mr-3"
                            >
                                Cancelar
                            </button>
                            <LoadingButton
                                loading={isSubmitting}
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
                            >
                                {editingAd ? "Guardar Cambios" : "Crear Anuncio"}
                            </LoadingButton>
                        </div>
                    </form>
                </div>
            )}

            {/* ────────────────── LISTADO ────────────────── */}
            {!isCreating && !editingAd && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Anuncios Registrados</h3>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                            {ads.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-400"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                    ) : ads.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3">ad_units</span>
                            <p className="text-sm text-slate-500 font-medium">No hay anuncios configurados.</p>
                            <p className="text-xs text-slate-400 mt-1">Crea tu primer anuncio y comienza a monetizar tu sitio web.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {ads.map(ad => (
                                <li key={ad.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    {/* Thumbnail */}
                                    <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 relative group">
                                        {ad.kind === "VIDEO" ? (
                                            <video src={ad.imageUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                                        ) : (
                                            <img src={ad.imageUrl} alt={ad.title || "Ad"} className="w-full h-full object-cover" />
                                        )}
                                        {ad.kind === "VIDEO" && (
                                            <div className="absolute top-1 right-1 bg-black/50 text-white rounded p-0.5 pointer-events-none">
                                                <span className="material-symbols-outlined text-[12px]">videocam</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
                                                {ad.title || <span className="text-slate-400 italic font-normal">Sin título</span>}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${placementColors[ad.placement]}`}>
                                                {placementLabels[ad.placement]}
                                            </span>
                                            {ad.isActive ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            {ad.targetUrl && (
                                                <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[250px] flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">link</span>
                                                    {ad.targetUrl}
                                                </a>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">sort</span>
                                                Pos: {ad.position}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            onClick={() => handleToggleActive(ad)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${ad.isActive
                                                    ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    : "border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                                                }`}
                                        >
                                            {ad.isActive ? "Desactivar" : "Activar"}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
