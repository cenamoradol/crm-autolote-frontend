"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createActivity, type ActivityType } from "@/lib/activities";
import { searchCustomers, searchLeads, searchVehicles } from "@/lib/lookups";
import { getCustomer } from "@/lib/customers";
import { getLead } from "@/lib/leads";
import { getVehicle } from "@/lib/vehicles";

// --- Icons ---
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
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
function IconCar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}
function IconX({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

// Reuse EntitySearch Logic
function EntitySearch({
  label,
  Icon,
  selected,
  onSelect,
  searchFn,
  placeholder
}: {
  label: string,
  Icon: any,
  selected?: { id: string, name: string } | null,
  onSelect: (val: { id: string, name: string } | null) => void,
  searchFn: (q: string) => Promise<any[]>,
  placeholder: string
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res: any = await searchFn(q);
        const items = Array.isArray(res) ? res : (res.data || res.items || []);
        setResults(items);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, searchFn]);

  if (selected) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900 line-clamp-1">{selected.name}</span>
          </div>
          <button type="button" onClick={() => onSelect(null)} className="text-gray-400 hover:text-red-500">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 relative">
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 pl-10 pr-3 text-sm"
          placeholder={placeholder}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {open && q.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none">
          {results.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No se encontraron resultados.</div>
          ) : (
            results.map((item: any, idx: number) => (
              <button
                key={`${item.value}-${idx}`}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                onClick={() => {
                  onSelect({ id: item.value, name: item.label });
                  setOpen(false);
                  setQ("");
                }}
              >
                <span className="font-medium text-gray-900">
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-xs text-gray-500">
                    {item.sublabel}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />}
    </div>
  )
}

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    if (d.startsWith("http://") || d.startsWith("https://")) return null;
    return d;
  } catch { return null; }
}

export default function ActivityCreatePage() {
  const sp = useSearchParams();
  const router = useRouter();

  const directReturnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? safeDecode(sp.get("backTo")), [sp]);

  // Params
  const pLeadId = sp.get("leadId") || "";
  const pCustomerId = sp.get("customerId") || "";
  const pVehicleId = sp.get("vehicleId") || "";

  const returnTo = useMemo(() => {
    if (directReturnTo) return directReturnTo;
    if (pLeadId || pCustomerId || pVehicleId) {
      const qs = new URLSearchParams();
      if (pLeadId) qs.set("leadId", pLeadId);
      if (pCustomerId) qs.set("customerId", pCustomerId);
      if (pVehicleId) qs.set("vehicleId", pVehicleId);
      return `/activities?${qs.toString()}`;
    }
    return "/activities";
  }, [directReturnTo, pLeadId, pCustomerId, pVehicleId]);

  // State
  const [type, setType] = useState<ActivityType>("" as any);
  const [notes, setNotes] = useState("");

  const [lead, setLead] = useState<{ id: string, name: string } | null>(null);
  const [customer, setCustomer] = useState<{ id: string, name: string } | null>(null);
  const [vehicle, setVehicle] = useState<{ id: string, name: string } | null>(null);

  const [validationErr, setValidationErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load Presets
  useEffect(() => {
    if (pLeadId) getLead(pLeadId).then(l => setLead({ id: l.id, name: l.fullName || l.phone || "Lead" })).catch(() => { });
    if (pCustomerId) getCustomer(pCustomerId).then(c => setCustomer({ id: c.id, name: c.fullName || "Cliente" })).catch(() => { });
    if (pVehicleId) getVehicle(pVehicleId).then(v => setVehicle({ id: v.id, name: v.title || v.publicId || "Vehículo" })).catch(() => { });
  }, [pLeadId, pCustomerId, pVehicleId]);

  async function handleSubmit() {
    // Validation: Must select type
    if (!type) {
      setValidationErr("Seleccione un tipo de actividad");
      return;
    }

    // Validation: At least one context
    if (!lead && !customer && !vehicle) {
      setValidationErr("Debe seleccionar al menos una entidad vinculada (Lead, Cliente o Vehículo).");
      return;
    }

    setSaving(true);
    setValidationErr(null);

    try {
      await createActivity({
        type,
        notes: notes || undefined,
        leadId: lead?.id,
        customerId: customer?.id,
        vehicleId: vehicle?.id
      });
      // Redirect
      router.push(returnTo);
    } catch (e: any) {
      setValidationErr(e.message || "Error al crear actividad");
      setSaving(false);
    }
  }

  const ACTIVITY_TYPES: ActivityType[] = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE"];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/activities" className="hover:text-blue-600">Actividades</Link>
            <span className="mx-2">›</span>
            <span>Nueva</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Actividad</h1>
            <Link
              href={returnTo}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Actividad</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-3 text-sm bg-white"
              value={type}
              onChange={e => setType(e.target.value as ActivityType)}
            >
              <option value="" disabled>Seleccione el tipo...</option>
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 text-sm min-h-[120px]"
              placeholder="Describe los detalles de la actividad realizada..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">CONTEXTO (VINCULACIÓN)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EntitySearch
                label="Lead"
                Icon={IconUser}
                placeholder="Buscar lead..."
                searchFn={searchLeads}
                selected={lead}
                onSelect={setLead}
              />
              <EntitySearch
                label="Cliente"
                Icon={IconBriefcase}
                placeholder="Buscar cliente..."
                searchFn={searchCustomers}
                selected={customer}
                onSelect={setCustomer}
              />
              <EntitySearch
                label="Vehículo"
                Icon={IconCar}
                placeholder="Buscar vehículo..."
                searchFn={searchVehicles}
                selected={vehicle}
                onSelect={setVehicle}
              />
            </div>
          </div>

          {validationErr && (
            <div className="flex items-center text-red-600 text-sm font-medium mb-6 animate-pulse">
              <IconInfo className="w-4 h-4 mr-2" />
              {validationErr}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3 mb-8">
            <IconInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Es requerido seleccionar al menos un <b>Lead</b>, <b>Cliente</b> o <b>Vehículo</b> para registrar la actividad. Esto ayuda a mantener un historial organizado.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href={returnTo}
              className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-70"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <IconCheck className="w-4 h-4 mr-2" />
                  Registrar Actividad
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
