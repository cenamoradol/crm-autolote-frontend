"use client";

import { useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";
import type { Customer, CustomerCreateInput } from "@/lib/customers";

export default function CustomerForm({
  mode,
  initial,
  submitLabel,
  onSubmit
}: {
  mode: "create" | "edit";
  initial?: Partial<Customer>;
  submitLabel?: string;
  onSubmit: (data: CustomerCreateInput) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [documentId, setDocumentId] = useState(initial?.documentId ?? "");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => fullName.trim().length >= 2, [fullName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) {
      setErr("Nombre debe tener al menos 2 caracteres.");
      return;
    }

    setSaving(true);
    setErr(null);

    const payload: CustomerCreateInput = {
      fullName: fullName.trim(),
      phone: phone.trim() ? phone.trim() : null,
      email: email.trim() ? email.trim() : null,
      documentId: documentId.trim() ? documentId.trim() : null
    };

    try {
      await onSubmit(payload);
    } catch (e: any) {
      setErr(e?.message || "Error guardando customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-2">{mode === "create" ? "Crear customer" : "Editar customer"}</h5>
        <p className="text-muted mb-3">UI mínima (más adelante lo mejoramos).</p>

        {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

        <form onSubmit={submit} className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Nombre completo *</label>
            <input className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Teléfono</label>
            <input className="form-control" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Documento</label>
            <input className="form-control" value={documentId ?? ""} onChange={(e) => setDocumentId(e.target.value)} />
          </div>

          <div className="col-12">
            <label className="form-label">Email</label>
            <input className="form-control" value={email ?? ""} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="col-12 d-flex gap-2">
            <LoadingButton loading={saving} className="btn btn-primary" type="submit">
              {submitLabel ?? (mode === "create" ? "Crear" : "Guardar")}
            </LoadingButton>

            <a className="btn btn-outline-secondary" href="/customers">
              Volver
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
