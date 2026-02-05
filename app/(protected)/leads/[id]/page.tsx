"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteLead, getLead, updateLead, type Lead, type LeadStatus } from "@/lib/leads";
import { searchCustomers } from "@/lib/lookups";

// --- Icons ---
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
function IconPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
function IconEye({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
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
function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
function IconLink({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
function IconInfo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
function IconMessageSquare({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// --- Customer Search Component ---
function CustomerSearchTW({
  selected,
  onChange
}: {
  selected?: { id: string, name: string } | null,
  onChange: (val: { id: string, name: string } | null) => void
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res: any = await searchCustomers(q);
        // normalized response
        const items = Array.isArray(res) ? res : (res.data || res.items || []);
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  if (selected) {
    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {selected.name.charAt(0)}
          </div>
          <span className="font-medium text-blue-900">{selected.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 pl-9 pr-3 text-sm"
          placeholder="Buscar cliente existente..."
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconUser className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {open && q.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none">
          {searching ? (
            <div className="px-4 py-2 text-gray-500 italic">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No se encontraron clientes.</div>
          ) : (
            results.map(c => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                onClick={() => {
                  onChange({ id: c.id, name: c.fullName || c.phone || c.email });
                  setOpen(false);
                  setQ("");
                }}
              >
                <span className="font-medium text-gray-900">{c.fullName || "Sin nombre"}</span>
                <span className="text-xs text-gray-500">{c.email} · {c.phone}</span>
              </button>
            ))
          )}
        </div>
      )}
      {/* Backdrop to close */}
      {open && (
        <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : params) as { id: string };
  const id = resolved.id;

  const sp = useSearchParams();
  const router = useRouter();
  const returnTo = sp.get("returnTo") || "/leads";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [source, setSource] = useState("");
  const [customer, setCustomer] = useState<{ id: string, name: string } | null>(null);

  // Internal Notes used as "Notas Rápidas" - mapping to description for now or notes if available
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await getLead(id);
      setLead(data);

      // Init form
      setFullName(data.fullName || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setStatus(data.status as LeadStatus || "NEW");
      setSource(data.source || "");
      setNotes((data as any).description || ""); // Assuming description or similar field

      if (data.customer) {
        setCustomer({ id: data.customer.id, name: data.customer.fullName });
      } else if (data.customerId) {
        // If we had a way to get customer name from ID synchronously we would, otherwise we wait or fetch
      }

    } catch (e: any) {
      setErr(e.message || "Error al cargar lead");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      await updateLead(id, {
        fullName: fullName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        status,
        source: source || undefined,
        customerId: customer?.id || null
      });
      // Reload to ensure sync
      await load();
      alert("Lead actualizado correctamente");
    } catch (e: any) {
      setErr(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer.")) return;
    try {
      await deleteLead(id);
      router.replace(returnTo);
    } catch (e: any) {
      alert("Error al eliminar: " + e.message);
    }
  }

  // Links
  const activitiesHref = lead ? `/activities?leadId=${lead.id}&returnTo=${encodeURIComponent(`/leads/${lead.id}`)}` : "#";
  const createActivityHref = lead ? `/activities/new?leadId=${lead.id}&returnTo=${encodeURIComponent(`/leads/${lead.id}`)}` : "#";

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando lead...</div>;
  if (!lead) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Lead no encontrado</h2>
      <Link href={returnTo} className="text-blue-600 hover:underline">Volver al listado</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/leads" className="hover:text-blue-600">Leads</Link>
            <span className="mx-2">/</span>
            <span>Detalle del Lead</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detalle del Lead: {lead.fullName || "Sin nombre"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={createActivityHref}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <IconPlus className="w-4 h-4 mr-2" />
                Registrar actividad
              </Link>
              <Link
                href={activitiesHref}
                className="inline-flex items-center px-4 py-2 border border-blue-200 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                <IconEye className="w-4 h-4 mr-2" />
                Ver actividades
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <IconTrash className="w-4 h-4 mr-2" />
                Eliminar
              </button>
              <Link
                href={returnTo}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-800"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (2/3) - Forms */}
          <div className="lg:col-span-2 space-y-8">

            <h2 className="text-lg font-bold text-gray-900">Información del Lead</h2>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconBriefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-600 uppercase">DATOS DE CONTACTO</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2"> // Name full width
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NOMBRE COMPLETO</label>
                  <input
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm bg-gray-50"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">TELÉFONO</label>
                  <input
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm bg-gray-50"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CORREO ELECTRÓNICO</label>
                  <input
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm bg-gray-50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Status & Source */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase">ORIGEN Y ESTADO</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ESTADO ACTUAL</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm bg-gray-50"
                    value={status}
                    onChange={e => setStatus(e.target.value as LeadStatus)}
                  >
                    <option value="NEW">Nuevo</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="WON">Ganado</option>
                    <option value="LOST">Perdido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FUENTE</label>
                  <input
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm bg-gray-50"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Ej. Facebook, Referido..."
                  />
                </div>
              </div>
            </div>

            {/* Customer Link */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconLink className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-600 uppercase">VINCULACIÓN</h3>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CLIENTE ASOCIADO</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <CustomerSearchTW selected={customer} onChange={setCustomer} />
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs font-bold whitespace-nowrap">
                    Nuevo cliente
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Si el prospecto ya es cliente, vincúlalo para ver su historial completo.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-blue-700 font-bold text-sm transition-colors flex items-center"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Panel de Resumen</h2>

            {/* Status Badge Card */}
            <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center border border-blue-100">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">ESTADO DEL LEAD</span>
              <span className="bg-blue-600 text-white text-xl font-bold px-6 py-2 rounded-full uppercase shadow-sm">
                {(status || "NEW").replace("_", " ")}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">ÚLTIMA ACTIVIDAD</span>
                  <span className="block text-sm font-bold text-gray-900 mt-1">Llamada</span>
                  <span className="block text-xs text-gray-500">14 Oct, 10:30</span>
                </div>
                <div className="pl-4">
                  <span className="block text-xs font-bold text-gray-400 uppercase">TIEMPO RESP.</span>
                  <span className="block text-sm font-bold text-blue-600 mt-1">2h 15m</span>
                  <span className="block text-xs text-gray-500">Promedio actual</span>
                </div>
              </div>
            </div>

            {/* Quick Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <IconMessageSquare className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase">NOTAS RÁPIDAS</h3>
              </div>
              <textarea
                className="w-full border border-yellow-200 bg-yellow-50 rounded-md p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 min-h-[120px]"
                placeholder="Escribe recordatorios persistentes aquí..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Info Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex space-x-2 text-xs text-gray-500 mb-2">
                <span>Creado:</span>
                <span className="font-medium text-gray-900">
                  {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex space-x-2 text-xs text-gray-500">
                <span>Asignado a:</span>
                <span className="font-medium text-gray-900">
                  {lead?.assignedTo?.fullName || lead?.assignedTo?.email || "Sin asignar"}
                </span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-blue-50 rouded-lg border border-blue-100 p-4 rounded-lg flex gap-3">
              <IconInfo className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-800 mb-1">Próximo paso recomendado</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Realizar seguimiento telefónico para agendar una cita de prueba de manejo.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
