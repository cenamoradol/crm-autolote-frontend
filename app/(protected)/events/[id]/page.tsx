"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Event as EventModel,
  EventCategory,
  getEventById,
  updateEvent,
  getEventCategories,
  addEventVehicles,
  removeEventVehicle
} from "@/lib/events";
import { listVehicles, Vehicle } from "@/lib/vehicles";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";
import EventMediaManager from "@/components/events/EventMediaManager";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();

  const [event, setEvent] = useState<EventModel | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tabs: INFO | GALLERY | VEHICLES
  const [activeTab, setActiveTab] = useState<"INFO" | "GALLERY" | "VEHICLES">("INFO");

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Vehicle Selection State
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [ev, cats] = await Promise.all([
        getEventById(eventId),
        getEventCategories()
      ]);
      setEvent(ev);
      setCategories(cats);

      setName(ev.name);
      setCategoryId(ev.categoryId);
      setDescription(ev.description || "");
      if (ev.date) {
        setDate(ev.date.split("T")[0]); // Set YYYY-MM-DD
      }
      setIsPublished(ev.isPublished);
    } catch (e: any) {
      setError(e.message || "Error al cargar evento.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableVehicles() {
    try {
      // Filter out vehicles already in the event
      const allVehicles = await listVehicles({ status: "AVAILABLE" });
      const eventVehicleIds = new Set(event?.vehicles?.map(v => v.vehicleId) || []);
      setAvailableVehicles(allVehicles.filter(v => !eventVehicleIds.has(v.id)));
    } catch (e) {
      console.error("Error cargando vehículos", e);
    }
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === "VEHICLES") {
      loadAvailableVehicles();
    }
  }, [activeTab, event]);

  async function handleSaveBasicInfo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateEvent(eventId, {
        name,
        categoryId,
        description: description || undefined,
        date: date ? new Date(date).toISOString() : undefined,
        isPublished
      });
      setSuccess("Evento actualizado correctamente.");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Error al guardar información.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVehicle() {
    if (!selectedVehicleId) return;
    setAddingVehicle(true);
    try {
      await addEventVehicles(eventId, [selectedVehicleId]);
      setSelectedVehicleId("");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Error al asociar vehículo.");
    } finally {
      setAddingVehicle(false);
    }
  }

  async function handleRemoveVehicle(vehicleId: string) {
    if (!confirm("¿Seguro que deseas remover este vehículo del evento?")) return;
    try {
      await removeEventVehicle(eventId, vehicleId);
      await loadData();
    } catch (e: any) {
      setError(e.message || "Error al remover vehículo.");
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando evento...</div>;
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Evento no encontrado.</p>
        <Link href="/events" className="text-blue-600 hover:underline mt-4 inline-block">Volver a eventos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/events" className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">En la categoría: <span className="font-semibold text-slate-700 dark:text-slate-300">{event.category?.name}</span></p>
        </div>
      </div>

      {error && <InlineAlert message={error} type="danger" onClose={() => setError(null)} />}
      {success && <InlineAlert message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("INFO")}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === "INFO" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("GALLERY")}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "GALLERY" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            <span className="material-symbols-outlined text-[18px]">photo_library</span>
            Galería
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{event._count?.media || 0}</span>
          </button>
          <button
            onClick={() => setActiveTab("VEHICLES")}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "VEHICLES" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
            Vehículos
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{event._count?.vehicles || 0}</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "INFO" && (
            <form onSubmit={handleSaveBasicInfo} className="max-w-3xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre del Evento</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    required
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha del Evento</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-1 self-end pb-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${isPublished ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublished ? 'translate-x-6' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isPublished ? 'Publicado' : 'Borrador / Oculto'}
                        </span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                        />
                    </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descripción (Opcional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detalles del evento..."
                  className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <LoadingButton
                  loading={saving}
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-sm shadow-blue-600/20"
                >
                  Guardar Cambios
                </LoadingButton>
              </div>
            </form>
          )}

          {activeTab === "GALLERY" && (
            <EventMediaManager eventId={eventId} />
          )}

          {activeTab === "VEHICLES" && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Asociar Vehículo Disponible</label>
                        <select
                            value={selectedVehicleId}
                            onChange={e => setSelectedVehicleId(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Selecciona un vehículo o usa el buscador interior</option>
                            {availableVehicles.map(v => (
                                <option key={v.id} value={v.id}>#{v.publicId} - {v.title || `${v.brand?.name} ${v.model?.name} ${v.year}`} - {v.price} ({v.vin})</option>
                            ))}
                        </select>
                    </div>
                    <LoadingButton
                        loading={addingVehicle}
                        onClick={handleAddVehicle}
                        disabled={!selectedVehicleId}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-[9px] rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        Asociar
                    </LoadingButton>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">ID / Título</th>
                                <th className="px-4 py-3">VIN / Placa</th>
                                <th className="px-4 py-3">Precio</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-800">
                            {!event.vehicles || event.vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No hay vehículos asociados a este evento.</td>
                                </tr>
                            ) : (
                                event.vehicles.map(ev => {
                                    const v = ev.vehicle;
                                    if (!v) return null;
                                    return (
                                        <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                        #{v.publicId}
                                                    </span>
                                                    {v.title || `${v.brand?.name} ${v.model?.name} ${v.year}`}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-mono">{v.vin || 'N/A'}</span>
                                                    <span className="opacity-70">{v.plate || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                                                {v.price}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleRemoveVehicle(v.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-block"
                                                    title="Remover del evento"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
