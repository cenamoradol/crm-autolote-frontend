"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listServices, deleteService, setServicePublished, type ServiceListing } from "@/lib/services";
import toast from "react-hot-toast";

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listServices();
      setItems(data);
    } catch (e: any) {
      toast.error(e?.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await deleteService(id);
      toast.success("Servicio eliminado");
      load();
    } catch (e: any) {
      toast.error("Error al eliminar");
    }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    try {
      await setServicePublished(id, !current);
      toast.success("Estado actualizado");
      load();
    } catch (e: any) {
      toast.error("Error al actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Directorio de Servicios</h1>
          <p className="text-slate-500">Maneja servicios promocionales o clasificados del lote.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/services/categories"
            className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">category</span>
            Categorías
          </Link>
          <Link
            href="/services/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Crear Servicio
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4">Servicio</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Publicado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((srv) => (
              <tr key={srv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{srv.name}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{srv.description || "Sin descripción"}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {srv.category?.name || srv.serviceType || "S/N"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {srv.phone ? <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {srv.phone}</div> : null}
                  {srv.address ? <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><span className="material-symbols-outlined text-[14px]">location_on</span> {srv.address}</div> : null}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(srv.id, srv.isPublished)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      srv.isPublished ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {srv.isPublished ? "Sí" : "No"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/services/${srv.id}`}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No hay servicios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
