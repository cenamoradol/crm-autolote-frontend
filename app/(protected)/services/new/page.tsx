"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createService, type ServiceListingPayload } from "@/lib/services";
import { listServiceCategories, type ServiceCategory } from "@/lib/service-categories";
import toast from "react-hot-toast";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState<ServiceListingPayload>({
    name: "",
    serviceType: "",
    categoryId: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    isPublished: false,
  });

  useEffect(() => {
    listServiceCategories().then(setCategories).catch(() => toast.error("Error al cargar categorías"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "categoryId") {
      const val = value === "" ? null : value;
      const cat = categories.find(c => c.id === val);
      setFormData({ 
        ...formData, 
        categoryId: val, 
        serviceType: cat?.name || "" 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serviceType) {
      toast.error("El nombre y el tipo son requeridos");
      return;
    }
    setLoading(true);
    try {
      const created = await createService(formData);
      toast.success("Servicio creado exitosamente");
      router.push(`/services/${created.id}`); // redirigir a editar para subir fotos
    } catch (e: any) {
      toast.error(e?.message || "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Servicio Comercial</h1>
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">
          Volver
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Negocio *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Taller El Mecánico"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría del Servicio *</label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <Link href="/services/categories" className="text-[10px] text-blue-500 hover:underline mt-1 block">
                  + Crear categorías primero
                </Link>
              )}
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="contacto@negocio.com"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Av. Principal #123, Ciudad"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cuéntanos más sobre los servicios..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar e Ir a Fotos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
