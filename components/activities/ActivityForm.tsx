"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";
import SearchSelect, { type SearchOption } from "@/components/ui/SearchSelect";

import type { Activity, ActivityCreateInput, ActivityType } from "@/lib/activities";
import { searchCustomers, searchLeads, searchVehicles } from "@/lib/lookups";

// Para pintar label bonito cuando viene preset
import { getCustomer } from "@/lib/customers";
import { getLead } from "@/lib/leads";
import { getVehicle } from "@/lib/vehicles";

const TYPES: ActivityType[] = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE"];

function isSearchOptionArray(x: any): x is SearchOption[] {
  return Array.isArray(x) && x.every((o) => o && typeof o.value === "string" && typeof o.label === "string");
}

function unwrapArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

export default function ActivityForm({
  mode,
  initial,
  preset,
  onSubmit,
  submitLabel,
  backHref
}: {
  mode: "create" | "edit";
  initial?: Partial<Activity>;
  preset?: { leadId?: string; customerId?: string; vehicleId?: string };
  onSubmit: (data: ActivityCreateInput) => Promise<void>;
  submitLabel?: string;
  backHref?: string;
}) {
  const [type, setType] = useState<ActivityType>((initial?.type as ActivityType) ?? "NOTE");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // ✅ Unificamos SearchOption a { value, label, sublabel? }
  const [leadOpt, setLeadOpt] = useState<SearchOption | null>(() => {
    const leadAny: any = (initial as any)?.lead;

    if (leadAny?.id) {
      return {
        value: leadAny.id,
        label: leadAny.fullName ?? leadAny.phone ?? leadAny.email ?? "(Lead)",
        sublabel: [leadAny.status ? `Status: ${leadAny.status}` : "", leadAny.phone ?? "", leadAny.email ?? ""]
          .filter(Boolean)
          .join(" · ")
      };
    }

    if ((initial as any)?.leadId) return { value: String((initial as any).leadId), label: "(Lead seleccionado)" };
    if (preset?.leadId) return { value: String(preset.leadId), label: "(Lead seleccionado)" };
    return null;
  });

  const [customerOpt, setCustomerOpt] = useState<SearchOption | null>(() => {
    const customerAny: any = (initial as any)?.customer;

    if (customerAny?.id) {
      return {
        value: customerAny.id,
        label: customerAny.fullName ?? customerAny.phone ?? customerAny.email ?? "(Customer)",
        sublabel: [customerAny.phone, customerAny.email].filter(Boolean).join(" · ")
      };
    }

    if ((initial as any)?.customerId) return { value: String((initial as any).customerId), label: "(Customer seleccionado)" };
    if (preset?.customerId) return { value: String(preset.customerId), label: "(Customer seleccionado)" };
    return null;
  });

  const [vehicleOpt, setVehicleOpt] = useState<SearchOption | null>(() => {
    const vehicleAny: any = (initial as any)?.vehicle;

    if (vehicleAny?.id) {
      return {
        value: vehicleAny.id,
        label: vehicleAny.title ?? vehicleAny.publicId ?? "(Vehicle)",
        sublabel: [
          vehicleAny.status ? `Status: ${vehicleAny.status}` : "",
          vehicleAny.publicId ? `ID público: ${vehicleAny.publicId}` : ""
        ]
          .filter(Boolean)
          .join(" · ")
      };
    }

    if ((initial as any)?.vehicleId) return { value: String((initial as any).vehicleId), label: "(Vehicle seleccionado)" };
    if (preset?.vehicleId) return { value: String(preset.vehicleId), label: "(Vehicle seleccionado)" };
    return null;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const finalBack = backHref && backHref.startsWith("/") && !backHref.startsWith("//") ? backHref : "/activities";

  // ✅ Wrappers para garantizar que SearchSelect siempre reciba SearchOption[]
  const loadLeads = useCallback(async (q: string): Promise<SearchOption[]> => {
    const res: any = await searchLeads(q);
    if (isSearchOptionArray(res)) return res;

    const rows = unwrapArray(res);
    return rows.map((l: any) => ({
      value: String(l.id),
      label: l.fullName ?? l.phone ?? l.email ?? "(Lead)",
      sublabel: [l.status ? `Status: ${l.status}` : "", l.phone ?? "", l.email ?? ""].filter(Boolean).join(" · ")
    }));
  }, []);

  const loadCustomers = useCallback(async (q: string): Promise<SearchOption[]> => {
    const res: any = await searchCustomers(q);
    if (isSearchOptionArray(res)) return res;

    const rows = unwrapArray(res);
    return rows.map((c: any) => ({
      value: String(c.id),
      label: c.fullName ?? c.phone ?? c.email ?? "(Customer)",
      sublabel: [c.phone ?? "", c.email ?? ""].filter(Boolean).join(" · ")
    }));
  }, []);

  const loadVehicles = useCallback(async (q: string): Promise<SearchOption[]> => {
    const res: any = await searchVehicles(q);
    if (isSearchOptionArray(res)) return res;

    const rows = unwrapArray(res);
    return rows.map((v: any) => {
      const label =
        v.title ??
        [v.brand?.name, v.model?.name, v.year ? String(v.year) : ""].filter(Boolean).join(" ") ??
        v.publicId ??
        "(Vehicle)";

      return {
        value: String(v.id),
        label,
        sublabel: [v.status ? `Status: ${v.status}` : "", v.publicId ? `ID público: ${v.publicId}` : "", v.vin ? `VIN: ${v.vin}` : ""]
          .filter(Boolean)
          .join(" · ")
      };
    });
  }, []);

  // Pre-cargar labels reales cuando vienen preset IDs (para no mostrar "(seleccionado)")
  useEffect(() => {
    let alive = true;

    (async () => {
      const pid = preset?.leadId;
      if (!pid) return;

      if (leadOpt?.value === pid && leadOpt.label && !leadOpt.label.includes("seleccionado")) return;

      try {
        const l: any = await getLead(pid);
        if (!alive) return;
        setLeadOpt({
          value: String(l.id),
          label: l.fullName ?? l.phone ?? l.email ?? "(Lead)",
          sublabel: [l.status ? `Status: ${l.status}` : "", l.phone ?? "", l.email ?? ""].filter(Boolean).join(" · ")
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.leadId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const pid = preset?.customerId;
      if (!pid) return;

      if (customerOpt?.value === pid && customerOpt.label && !customerOpt.label.includes("seleccionado")) return;

      try {
        const c: any = await getCustomer(pid);
        if (!alive) return;
        setCustomerOpt({
          value: String(c.id),
          label: c.fullName ?? c.phone ?? c.email ?? "(Customer)",
          sublabel: [c.phone ?? "", c.email ?? ""].filter(Boolean).join(" · ")
        });
      } catch {}
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.customerId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const pid = preset?.vehicleId;
      if (!pid) return;

      if (vehicleOpt?.value === pid && vehicleOpt.label && !vehicleOpt.label.includes("seleccionado")) return;

      try {
        const v: any = await getVehicle(pid);
        if (!alive) return;

        const label =
          v.title ??
          [v.brand?.name, v.model?.name, v.year ? String(v.year) : ""].filter(Boolean).join(" ") ??
          v.publicId ??
          "(Vehicle)";

        setVehicleOpt({
          value: String(v.id),
          label,
          sublabel: [v.status ? `Status: ${v.status}` : "", v.publicId ? `ID público: ${v.publicId}` : ""].filter(Boolean).join(" · ")
        });
      } catch {}
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.vehicleId]);

  const hasAnyContext = useMemo(() => {
    return !!(leadOpt?.value || customerOpt?.value || vehicleOpt?.value);
  }, [leadOpt, customerOpt, vehicleOpt]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasAnyContext) {
      setErr("Selecciona al menos un contexto: Lead o Customer o Vehicle.");
      return;
    }

    setSaving(true);
    setErr(null);

    const payload: ActivityCreateInput = {
      type,
      notes: notes.trim() ? notes.trim() : null,
      leadId: leadOpt?.value ?? null,
      customerId: customerOpt?.value ?? null,
      vehicleId: vehicleOpt?.value ?? null
    };

    try {
      await onSubmit(payload);
    } catch (e: any) {
      setErr(e?.message || "Error guardando actividad");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-2">{mode === "create" ? "Registrar actividad" : "Editar actividad"}</h5>
        <p className="text-muted mb-3">UI mínima con buscador (sin IDs).</p>

        {/* ✅ Normalizado: InlineAlert usa type */}
        {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}

        <form onSubmit={submit} className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-8">
            <label className="form-label">Notas</label>
            <input
              className="form-control"
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Llamada, pidió info, agendar visita..."
            />
          </div>

          <div className="col-12">
            <div className="alert alert-light border small mb-0">
              Selecciona al menos uno: <b>Lead</b> / <b>Customer</b> / <b>Vehicle</b>. Puedes seleccionar varios si aplica.
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <SearchSelect
              label="Lead (opcional)"
              value={leadOpt}
              onChange={(x) => setLeadOpt(x)}
              loadOptions={loadLeads}
              placeholder="Buscar lead por nombre/teléfono/email..."
            />
          </div>

          <div className="col-12 col-lg-4">
            <SearchSelect
              label="Customer (opcional)"
              value={customerOpt}
              onChange={(x) => setCustomerOpt(x)}
              loadOptions={loadCustomers}
              placeholder="Buscar customer por nombre/teléfono/email..."
            />
          </div>

          <div className="col-12 col-lg-4">
            <SearchSelect
              label="Vehicle (opcional)"
              value={vehicleOpt}
              onChange={(x) => setVehicleOpt(x)}
              loadOptions={loadVehicles}
              placeholder="Buscar vehicle por título / modelo / año..."
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <LoadingButton loading={saving} className="btn btn-primary" type="submit">
              {submitLabel ?? (mode === "create" ? "Registrar" : "Guardar")}
            </LoadingButton>

            <a className="btn btn-outline-secondary" href={finalBack}>
              Volver
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
