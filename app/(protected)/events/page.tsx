"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    EventCategory,
    Event as EventModel,
    getEventCategories,
    createEventCategory,
    updateEventCategory,
    deleteEventCategory,
    getEvents,
    createEvent,
    deleteEvent,
    publishEvent
} from "@/lib/events";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function EventsPage() {
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
    const [events, setEvents] = useState<EventModel[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // Category Management
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    // Event Management
    const [newEventName, setNewEventName] = useState("");
    const [creatingEvent, setCreatingEvent] = useState(false);

    async function loadCategories() {
        setLoadingCategories(true);
        try {
            const data = await getEventCategories();
            setCategories(data);
        } catch (e: any) {
            setError(e.message || "Error cargando categorías");
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadEvents(categoryId: string) {
        setLoadingEvents(true);
        try {
            const data = await getEvents(categoryId);
            setEvents(data);
        } catch (e: any) {
            setError(e.message || "Error cargando eventos");
        } finally {
            setLoadingEvents(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadEvents(selectedCategory.id);
        } else {
            setEvents([]);
        }
    }, [selectedCategory]);

    // Category Actions
    async function handleCreateCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setCreatingCategory(true);
        try {
            await createEventCategory({ name: newCategoryName.trim(), isActive: true });
            setNewCategoryName("");
            loadCategories();
        } catch (e: any) {
            setError(e.message || "Error al crear categoría");
        } finally {
            setCreatingCategory(false);
        }
    }

    async function handleUpdateCategory(id: string) {
        if (!editCategoryName.trim()) return;
        try {
            await updateEventCategory(id, { name: editCategoryName.trim() });
            setEditingCategoryId(null);
            loadCategories();
            if (selectedCategory?.id === id) {
                setSelectedCategory({ ...selectedCategory, name: editCategoryName.trim() });
            }
        } catch (e: any) {
            setError(e.message || "Error al actualizar categoría");
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!confirm("¿Seguro que deseas eliminar esta categoría? Esto podría afectar a los eventos asociados si la base de datos lo permite.")) return;
        try {
            await deleteEventCategory(id);
            if (selectedCategory?.id === id) setSelectedCategory(null);
            loadCategories();
        } catch (e: any) {
            setError(e.message || "Error al eliminar categoría");
        }
    }

    // Event Actions
    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCategory || !newEventName.trim()) return;
        setCreatingEvent(true);
        try {
            await createEvent({
                categoryId: selectedCategory.id,
                name: newEventName.trim(),
                isPublished: false
            });
            setNewEventName("");
            loadEvents(selectedCategory.id);
        } catch (e: any) {
            setError(e.message || "Error al crear evento");
        } finally {
            setCreatingEvent(false);
        }
    }

    async function handleDeleteEvent(id: string) {
        if (!confirm("¿Seguro que deseas eliminar este evento y todo su contenido?")) return;
        try {
            await deleteEvent(id);
            if (selectedCategory) loadEvents(selectedCategory.id);
        } catch (e: any) {
            setError(e.message || "Error al eliminar evento");
        }
    }

    async function handleTogglePublish(event: EventModel) {
        try {
            await publishEvent(event.id, !event.isPublished);
            if (selectedCategory) loadEvents(selectedCategory.id);
        } catch (e: any) {
             setError(e.message || "Error al cambiar estado de publicación");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Eventos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona categorías (Subastas, Remates) y sus eventos correspondientes.</p>
                </div>
                <button
                    onClick={() => { loadCategories(); if(selectedCategory) loadEvents(selectedCategory.id); }}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className={`material-symbols-outlined ${loadingCategories || loadingEvents ? "animate-spin" : ""}`}>refresh</span>
                </button>
            </div>

            {error && (
                <InlineAlert
                    message={error}
                    type="danger"
                    onClose={() => setError(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* CATEGORIES COLUMN */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Nueva Categoría</h3>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreateCategory} className="flex gap-2">
                                <input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Ej: Subastas, Eventos Especiales..."
                                    className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <LoadingButton
                                    loading={creatingCategory}
                                    disabled={!newCategoryName.trim()}
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
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Categorías</h3>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                                {categories.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {categories.length === 0 && !loadingCategories && (
                                <div className="p-12 text-center text-slate-400 text-sm italic">No hay categorías.</div>
                            )}
                            <ul className="divide-y divide-slate-50 dark:divide-slate-700">
                                {categories.map((c) => (
                                    <li
                                        key={c.id}
                                        onClick={() => setSelectedCategory(c)}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors group ${selectedCategory?.id === c.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 pl-3" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 pl-4 border-l-4 border-transparent"}`}
                                    >
                                        <div className="flex-1 mr-4">
                                            {editingCategoryId === c.id ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        value={editCategoryName}
                                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                                        className="flex-1 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-sm py-1 px-2"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateCategory(c.id);
                                                            if (e.key === 'Escape') setEditingCategoryId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleUpdateCategory(c.id)} className="text-green-600 hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                                    </button>
                                                    <button onClick={() => setEditingCategoryId(null)} className="text-slate-400 hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold tracking-tight ${selectedCategory?.id === c.id ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                        {c.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">/{c.slug}</span>
                                                </div>
                                            )}
                                        </div>

                                        {!editingCategoryId && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingCategoryId(c.id); setEditCategoryName(c.name); }}
                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }}
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

                {/* EVENTS COLUMN */}
                <div className="lg:col-span-8 space-y-4">
                    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-opacity ${!selectedCategory ? "opacity-40 pointer-events-none" : ""}`}>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                                {selectedCategory ? `Crear Evento en ${selectedCategory.name}` : "Crear Evento"}
                            </h3>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleCreateEvent} className="flex gap-2">
                                <input
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    placeholder="Ej: Edición Marzo 2026..."
                                    disabled={!selectedCategory}
                                    className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                />
                                <LoadingButton
                                    loading={creatingEvent}
                                    disabled={!newEventName.trim() || !selectedCategory}
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                >
                                    Añadir
                                </LoadingButton>
                            </form>
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col transition-opacity ${!selectedCategory ? "opacity-40" : ""}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                                {selectedCategory ? `Eventos de ${selectedCategory.name}` : "Selecciona una categoría"}
                            </h3>
                            {selectedCategory && (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                                    {events.length}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {!selectedCategory ? (
                                <div className="p-12 text-center text-slate-400 text-sm italic">
                                    Selecciona una categoría en la columna de la izquierda para ver sus eventos.
                                </div>
                            ) : events.length === 0 && !loadingEvents ? (
                                <div className="p-12 text-center text-slate-400 text-sm italic">No hay eventos para esta categoría.</div>
                            ) : (
                                <ul className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {events.map((ev) => (
                                        <li
                                            key={ev.id}
                                            className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                                                        {ev.name}
                                                    </span>
                                                    {ev.isPublished ? (
                                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Publicado</span>
                                                    ) : (
                                                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Borrador</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {ev.date ? new Date(ev.date).toLocaleDateString() : 'Sin fecha'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">image</span>
                                                        {ev._count?.media || 0} fotos
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">directions_car</span>
                                                        {ev._count?.vehicles || 0} vehículos
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <button
                                                    onClick={() => handleTogglePublish(ev)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    {ev.isPublished ? 'Ocultar' : 'Publicar'}
                                                </button>
                                                <Link
                                                    href={`/events/${ev.id}`}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteEvent(ev.id)}
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
                    </div>
                </div>

            </div>
        </div>
    );
}
