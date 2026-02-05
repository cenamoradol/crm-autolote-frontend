"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteActivity, getActivity, updateActivity, type Activity, type ActivityType } from "@/lib/activities";
import { searchCustomers, searchLeads, searchVehicles } from "@/lib/lookups";
import { getCustomer } from "@/lib/customers";
import { getLead } from "@/lib/leads";
import { getVehicle } from "@/lib/vehicles";

// --- Icons ---
function IconTrash({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}
function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
function IconInfo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
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

// --- Search Components ---

// Generic Search Select with specific icon
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
            <span className="font-medium text-gray-900">{selected.name}</span>
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

export default function ActivityEditPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : params) as { id: string };
  const id = resolved.id;

  const sp = useSearchParams();
  const router = useRouter();
  const returnTo = sp.get("returnTo") || "/activities";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Activity | null>(null);

  // Form State
  const [type, setType] = useState<ActivityType>("call" as any);
  const [notes, setNotes] = useState("");

  const [lead, setLead] = useState<{ id: string, name: string } | null>(null);
  const [customer, setCustomer] = useState<{ id: string, name: string } | null>(null);
  const [vehicle, setVehicle] = useState<{ id: string, name: string } | null>(null);

  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const a = await getActivity(id);
      setData(a);

      setType(a.type);
      setNotes(a.notes || "");

      if (a.lead) {
        setLead({ id: a.lead.id, name: a.lead.fullName || a.lead.phone || "Lead" });
      } else if (a.leadId) {
        getLead(a.leadId).then(l => setLead({ id: l.id, name: l.fullName || "Lead" })).catch(() => { });
      }

      if (a.customer) {
        setCustomer({ id: a.customer.id, name: a.customer.fullName || "Cliente" });
      } else if (a.customerId) {
        getCustomer(a.customerId).then(c => setCustomer({ id: c.id, name: c.fullName || "Cliente" })).catch(() => { });
      }

      if (a.vehicle) {
        setVehicle({ id: a.vehicle.id, name: a.vehicle.title || "Vehículo" });
      } else if (a.vehicleId) {
        getVehicle(a.vehicleId).then(v => setVehicle({ id: v.id, name: v.title || v.publicId || "Vehículo" })).catch(() => { });
      }

    } catch (e: any) {
      setErr(e.message || "Error al cargar actividad");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      await updateActivity(id, {
        type,
        notes: notes || undefined,
        leadId: lead?.id || null,
        customerId: customer?.id || null,
        vehicleId: vehicle?.id || null
      });
      alert("Actividad actualizada");
      router.push(returnTo);
    } catch (e: any) {
      setErr(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta actividad?")) return;
    try {
      await deleteActivity(id);
      router.replace(returnTo);
    } catch (e: any) {
      alert("Error al eliminar");
    }
  }

  const ACTIVITY_TYPES: ActivityType[] = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE"];

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">No encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/activities" className="hover:text-blue-600">Actividades</Link>
            <span className="mx-2">/</span>
            <span>Editar</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Editar Actividad</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <IconTrash className="w-4 h-4 mr-2" />
                Eliminar
              </button>
              <button
                onClick={() => load()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Refrescar
              </button>
              <Link href={returnTo} className="text-blue-600 font-medium px-4 hover:underline">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">

          {err && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {err}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Actividad</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-3 text-sm bg-white"
              value={type}
              onChange={e => setType(e.target.value as ActivityType)}
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            {/* Lead Search */}
            <EntitySearch
              label="Lead (Cliente)"
              Icon={IconUser}
              selected={lead || customer} // Show either lead or customer here as primary contact
              onSelect={val => {
                // Logic: If select lead, set lead. If select customer, set customer.
                // For simplicity in this combined widget, we'd need to know which one it is.
                // BUT, strict separation is better. Let's keep separate widgets like the plan implies but maybe cleaner.
                // Actually, the mockup shows "Lead (Cliente)" and "Vehículo".
                // Let's optimize: We show two widgets: Lead/Customer and Vehicle.
                if (!val) { setLead(null); setCustomer(null); return; }
                // We don't know if it's lead or customer from generic callback unless we track it
                setLead({ id: val.id, name: val.name });
                setCustomer(null); // Clear customer if manual lead select
              }}
              searchFn={searchLeads} // Default to searching leads for this box as per "Lead (Cliente)" label
              placeholder="Buscar lead..."
            />

            {/* Vehicle Search */}
            <EntitySearch
              label="Vehículo"
              Icon={IconCar}
              selected={vehicle}
              onSelect={setVehicle}
              searchFn={searchVehicles}
              placeholder="Buscar vehículo..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1">Notas de la Interacción</label>
            <textarea
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 text-sm min-h-[150px]"
              placeholder="Detalles de la actividad..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4 mb-8">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Creado el {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href={returnTo}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-100/50 border border-blue-200 rounded-lg p-4 flex gap-4">
          <div className="bg-blue-200 rounded-full p-2 h-fit text-blue-600">
            <IconInfo className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Información de Seguimiento</h4>
            <p className="text-sm text-gray-600">
              Esta actividad está vinculada a un registro del sistema. Asegúrese de completar todos los campos antes de guardar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
