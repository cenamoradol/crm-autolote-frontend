"use client";

import { useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";
import SearchSelect, { type SearchOption } from "@/components/ui/SearchSelect";
import { searchCustomers } from "@/lib/lookups";
import type { Lead, LeadCreateInput, LeadStatus } from "@/lib/leads";

const STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "WON", "LOST"];

export default function LeadForm({
  mode,
  initial,
  onSubmit,
  submitLabel,
  backHref
}: {
  mode: "create" | "edit";
  initial?: Partial<Lead>;
  onSubmit: (data: LeadCreateInput) => Promise<void>;
  submitLabel?: string;
  backHref?: string;
}) {
  const [status, setStatus] = useState<LeadStatus>((initial?.status as LeadStatus) ?? "NEW");
  const [source, setSource] = useState(initial?.source ?? "");

  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const [customerOpt, setCustomerOpt] = useState<SearchOption | null>(
    initial?.customer?.id
      ? { id: initial.customer.id, label: initial.customer.fullName, sublabel: [initial.customer.phone, initial.customer.email].filter(Boolean).join(" · ") }
      : initial?.customerId
      ? { id: initial.customerId, label: "(Customer seleccionado)" }
      : null
  );

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => {
    // mínimo: si no hay nombre, al menos un teléfono o email
    const n = fullName.trim().length >= 2;
    const p = phone.trim().length >= 6;
    const e = email.trim().length >= 5;
    return n || p || e;
  }, [fullName, phone, email]);

  const finalBackHref = backHref && backHref.startsWith("/") ? backHref : "/leads";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) {
      setErr("Ingresa al menos Nombre (2+), o Teléfono, o Email.");
      return;
    }

    setSaving(true);
    setErr(null);

    const payload: LeadCreateInput = {
      status,
      source: source.trim() ? source.trim() : null,

      fullName: fullName.trim() ? fullName.trim() : null,
      phone: phone.trim() ? phone.trim() : null,
      email: email.trim() ? email.trim() : null,

      customerId: customerOpt?.id ?? null
      // assignedToUserId lo dejamos para un bloque siguiente (selector de sellers)
    };

    try {
      await onSubmit(payload);
    } catch (e: any) {
      setErr(e?.message || "Error guardando lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-2">{mode === "create" ? "Crear lead" : "Editar lead"}</h5>
        <p className="text-muted mb-3">UI mínima (más adelante mejoramos asignación, preferencias, etc.).</p>

        {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

        <form onSubmit={submit} className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-8">
            <label className="form-label">Source</label>
            <input className="form-control" value={source ?? ""} onChange={(e) => setSource(e.target.value)} placeholder="Ej: Facebook, WhatsApp, Referido..." />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={fullName ?? ""} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Teléfono</label>
            <input className="form-control" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email ?? ""} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="col-12">
            <SearchSelect
              label="Customer (opcional)"
              value={customerOpt}
              onChange={(x) => setCustomerOpt(x)}
              fetchOptions={searchCustomers}
              placeholder="Busca por nombre/teléfono/email..."
            />
            <div className="form-text">Si seleccionas un customer, quedará ligado al lead.</div>
          </div>

          <div className="col-12 d-flex gap-2">
            <LoadingButton loading={saving} className="btn btn-primary" type="submit">
              {submitLabel ?? (mode === "create" ? "Crear" : "Guardar")}
            </LoadingButton>

            <a className="btn btn-outline-secondary" href={finalBackHref}>
              Volver
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
