"use client";

import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useMemo, useEffect, use } from "react";
import { getCustomer, updateCustomer, deleteCustomer, type Customer, type CustomerUpdateInput } from "@/lib/customers";
import { useUser } from "@/components/providers/UserProvider";

// Icons
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = useUser();
  const canDelete = user.isSuperAdmin || user.roles.includes("admin") || user.roles.includes("supervisor");

  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const returnTo = "/customers";

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCustomer(id);
        setCustomer(c);
        setFullName(c.fullName);
        setPhone(c.phone || "");
        setEmail(c.email || "");
        setDocumentId(c.documentId || "");
      } catch (e) {
        setError("No se pudo cargar el cliente");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: CustomerUpdateInput = {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        documentId: documentId.trim() || null
      };
      const updated = await updateCustomer(id, payload);
      setCustomer(updated);
      setSuccess("Cliente guardado correctamente");
    } catch (e: any) {
      setError(e.message || "Error guardando cliente");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.")) return;
    try {
      await deleteCustomer(id);
      window.location.href = returnTo;
    } catch (e: any) {
      setError("Error eliminando cliente: " + e.message);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando cliente...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500">Cliente no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/customers" className="hover:text-blue-600">Clientes</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Editar {customer.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>

            <div className="flex gap-2">
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-sm font-medium"
                >
                  <IconTrash className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
              <Link
                href={returnTo}
                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium"
              >
                <IconArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <IconUser className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Datos del Cliente</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nombre Completo *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej: Juan Pérez"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="juan@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+504 9999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Documento de Identidad (DNI/RTN)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="0801..."
                  value={documentId}
                  onChange={e => setDocumentId(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? "Guardando..." : (
                  <>
                    <IconSave className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Helper info */}
        <div className="mt-6 text-xs text-gray-400 flex flex-col gap-1 px-2">
          <span>ID: {customer.id}</span>
          <span>Registrado: {new Date(customer.createdAt || "").toLocaleString()}</span>
          <span>Última actualización: {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : "-"}</span>
        </div>
      </div>
    </div>
  );
}
