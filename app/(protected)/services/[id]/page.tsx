"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getService, updateService, uploadServiceMedia, removeServiceMedia, type ServiceListing } from "@/lib/services";
import { listServiceCategories, type ServiceCategory } from "@/lib/service-categories";
import toast from "react-hot-toast";
import Image from "next/image";

export default function EditServicePage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(props.params);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServiceListing | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  async function load() {
    try {
      const [service, cats] = await Promise.all([
        getService(params.id),
        listServiceCategories()
      ]);
      setData(service);
      setCategories(cats);
    } catch (e) {
      toast.error("Error al cargar");
      router.push("/services");
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!data) return;
    const { name, value } = e.target;
    
    if (name === "categoryId") {
      const val = value === "" ? null : value;
      const cat = categories.find(c => c.id === val);
      setData({ ...data, categoryId: val, serviceType: cat?.name || "" });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setLoading(true);
    try {
      await updateService(data.id, {
        name: data.name,
        serviceType: data.serviceType,
        categoryId: data.categoryId,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
      });
      toast.success("Actualizado");
    } catch (e) {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    try {
      toast.loading("Subiendo...", { id: "upload" });
      await uploadServiceMedia(data.id, file);
      toast.success("Subido correctamente", { id: "upload" });
      load();
    } catch (error) {
      toast.error("Error al subir imagen", { id: "upload" });
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("¿Eliminar imagen?")) return;
    try {
      await removeServiceMedia(params.id, mediaId);
      toast.success("Eliminada");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  if (!data) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar: {data.name}</h1>
        <button onClick={() => router.push("/services")} className="text-sm text-slate-500 hover:text-slate-700">
          Volver a Directorio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
          <h2 className="font-bold text-lg mb-4">Detalles</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input name="name" value={data.name} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                name="categoryId"
                value={data.categoryId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input name="phone" value={data.phone || ""} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <textarea name="address" value={data.address || ""} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea name="description" value={data.description || ""} rows={4} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border rounded-lg" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Guardar Cambios
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Galería ({data.media?.length || 0})</h2>
            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
              Subir Foto
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {data.media?.map((m) => (
              <div key={m.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3]">
                {m.kind === "VIDEO" ? (
                  <video src={m.url} className="object-cover w-full h-full" controls />
                ) : (
                  <Image src={m.url} alt="Media" fill className="object-cover" />
                )}
                <button
                  onClick={() => handleDeleteMedia(m.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}

            {(!data.media || data.media.length === 0) && (
              <div className="col-span-2 text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Aun no hay imágenes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
