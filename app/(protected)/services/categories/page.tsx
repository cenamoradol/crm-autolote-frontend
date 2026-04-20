"use client";

import { useEffect, useState } from "react";
import { 
  listServiceCategories, 
  createServiceCategory, 
  updateServiceCategory, 
  deleteServiceCategory,
  ServiceCategory 
} from "@/lib/service-categories";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await listServiceCategories();
      setCategories(data);
    } catch (e) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createServiceCategory(newName);
      setNewName("");
      toast.success("Categoría creada");
      load();
    } catch (e) {
      toast.error("Error al crear categoría");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateServiceCategory(id, editName);
      setIsEditing(null);
      toast.success("Categoría actualizada");
      load();
    } catch (e) {
      toast.error("Error al actualizar categoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro? Se desvinculará de los servicios (no se borrarán los servicios).")) return;
    try {
      await deleteServiceCategory(id);
      toast.success("Categoría eliminada");
      load();
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/services" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorías de Servicios</h1>
          <p className="text-slate-500 text-sm">Administra los tipos de servicios que ofreces.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Nueva Categoría</h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Mecánica General, Detallado, Fontanería..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              Agregar
            </button>
          </form>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando categorías...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">category</span>
              <p className="text-slate-400">No hay categorías creadas aún.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {isEditing === cat.id ? (
                  <div className="flex-1 flex gap-2 mr-4">
                    <input
                      autoFocus
                      type="text"
                      className="flex-1 px-3 py-1 rounded border border-blue-400 outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="text-green-600 hover:text-green-700 font-medium text-sm">Guardar</button>
                    <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-500 text-sm">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-medium text-slate-700 dark:text-white">{cat.name}</span>
                      <span className="ml-2 text-xs text-slate-400 font-mono">/{cat.slug}</span>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setIsEditing(cat.id); setEditName(cat.name); }}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
