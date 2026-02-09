"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { createLead, type LeadStatus, type LeadCreateInput } from "@/lib/leads";
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

function IconSave({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

// --- Components ---

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
            results.map((c: any) => (
              <button
                key={c.value}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                onClick={() => {
                  onChange({ id: c.value, name: c.label });
                  setOpen(false);
                  setQ("");
                }}
              >
                <span className="font-medium text-gray-900">{c.label}</span>
                {c.sublabel && <span className="text-xs text-gray-500">{c.sublabel}</span>}
              </button>
            ))
          )}

          <div className="border-t border-gray-100 p-2">
            <Link href="/customers/new" target="_blank" className="block text-center text-blue-600 hover:text-blue-800 text-xs font-medium py-1">
              + Crear nuevo cliente
            </Link>
          </div>
        </div>
      )}
      {/* Backdrop to close */}
      {open && (
        <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

export default function LeadCreatePage() {
  const sp = useSearchParams();
  const returnTo = "/leads";

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [source, setSource] = useState("");
  const [customer, setCustomer] = useState<{ id: string, name: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from customer if selected
  useEffect(() => {
    if (customer && !fullName) {
      // We could fetch customer details here to auto-fill phone/email if they are empty
      // But for now let's just assume manual entry or the user searches mainly to link
    }
  }, [customer, fullName]);

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!fullName && !customer) {
      setError("Debes indicar un nombre para el Lead o seleccionar un Cliente existente.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: LeadCreateInput = {
        fullName: fullName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        status,
        source: source || undefined,
        customerId: customer?.id || undefined
      };
      const created = await createLead(payload);
      // Redirect to edit page
      window.location.href = `/leads/${created.id}?returnTo=${encodeURIComponent(returnTo)}`;
    } catch (e: any) {
      setError(e.message || "Error al crear el lead");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/leads" className="hover:text-blue-600">Leads</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Nuevo Lead</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Lead</h1>
            <Link
              href={returnTo}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-medium"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <IconBriefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Información del Contacto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nombre Completo *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej: María González"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">O busca un cliente existente abajo para autocompletar.</p>
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
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="maria@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status & Source */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Origen y Estado</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Estado Inicial</label>
                <select
                  className={inputClass}
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
                <label className={labelClass}>Fuente / Origen</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ej: Facebook, Referido..."
                  value={source}
                  onChange={e => setSource(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Customer Link */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <IconLink className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Vincular Cliente (Opcional)</h2>
            </div>

            <div>
              <label className={labelClass}>Cliente Existente</label>
              <CustomerSearchTW selected={customer} onChange={setCustomer} />
              <p className="text-xs text-gray-500 mt-2">
                Si seleccionas un cliente, este Lead se asociará a su perfil.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.location.href = returnTo}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Guardando..." : (
                <>
                  <IconSave className="w-4 h-4" />
                  Crear Lead
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
