// components/sales/SaleForm.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { SearchSelect, type SearchOption } from "@/components/ui/SearchSelect";
import {
  createVehicleSale,
  deleteVehicleSale,
  type SaleUpsertPayload,
  type VehicleSale,
  updateVehicleSale,
} from "@/lib/sales";

async function listAllCustomers(): Promise<any[]> {
  const res = await fetch("/api/bff/customers", { cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data?.message as string) || "Error cargando clientes");
  return (data?.data ?? data) as any[];
}

async function listAllLeads(): Promise<any[]> {
  const res = await fetch("/api/bff/leads", { cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data?.message as string) || "Error cargando leads");
  return (data?.data ?? data) as any[];
}

function toOptionCustomer(c: any): SearchOption {
  return {
    value: c.id,
    label: c.fullName || "Cliente",
    sublabel: [c.phone, c.email].filter(Boolean).join(" · "),
  };
}
function toOptionLead(l: any): SearchOption {
  return {
    value: l.id,
    label: l.fullName || l.email || l.phone || "Lead",
    sublabel: [l.status, l.phone, l.email].filter(Boolean).join(" · "),
  };
}

export default function SaleForm({
  vehicleId,
  initialSale,
  onSaved,
}: {
  vehicleId: string;
  initialSale: VehicleSale | null;
  onSaved?: (sale: VehicleSale | null) => void;
}) {
  const [sale, setSale] = useState<VehicleSale | null>(initialSale);

  const [soldAt, setSoldAt] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [customerOpt, setCustomerOpt] = useState<SearchOption | null>(null);
  const [leadOpt, setLeadOpt] = useState<SearchOption | null>(null);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setSale(initialSale);

    const date = initialSale?.soldAt ? initialSale.soldAt.slice(0, 10) : "";
    setSoldAt(date);

    setSoldPrice(
      initialSale?.soldPrice === null || initialSale?.soldPrice === undefined ? "" : String(initialSale.soldPrice)
    );

    setNotes(initialSale?.notes || "");

    setCustomerOpt(
      initialSale?.customer
        ? { value: initialSale.customer.id, label: initialSale.customer.fullName }
        : initialSale?.customerId
        ? { value: initialSale.customerId, label: "Cliente seleccionado" }
        : null
    );

    setLeadOpt(
      initialSale?.lead
        ? { value: initialSale.lead.id, label: initialSale.lead.fullName || "Lead" }
        : initialSale?.leadId
        ? { value: initialSale.leadId, label: "Lead seleccionado" }
        : null
    );
  }, [initialSale]);

  const payload: SaleUpsertPayload = useMemo(
    () => ({
      soldAt,
      soldPrice: soldPrice === "" ? null : Number(soldPrice),
      notes: notes?.trim() ? notes.trim() : null,
      customerId: customerOpt?.value ?? null,
      leadId: leadOpt?.value ?? null,
    }),
    [soldAt, soldPrice, notes, customerOpt, leadOpt]
  );

  const loadCustomers = useCallback(async (q: string) => {
    const all = await listAllCustomers();
    const t = q.toLowerCase();
    const filtered = all.filter((c) => {
      const s = `${c.fullName || ""} ${c.phone || ""} ${c.email || ""}`.toLowerCase();
      return s.includes(t);
    });
    return filtered.slice(0, 12).map(toOptionCustomer);
  }, []);

  const loadLeads = useCallback(async (q: string) => {
    const all = await listAllLeads();
    const t = q.toLowerCase();
    const filtered = all.filter((l) => {
      const s = `${l.fullName || ""} ${l.phone || ""} ${l.email || ""} ${l.status || ""}`.toLowerCase();
      return s.includes(t);
    });
    return filtered.slice(0, 12).map(toOptionLead);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!payload.soldAt) {
      setErr("La fecha de venta (soldAt) es obligatoria.");
      return;
    }

    setSaving(true);
    try {
      const saved = sale
        ? await updateVehicleSale(vehicleId, payload)
        : await createVehicleSale(vehicleId, payload);

      setSale(saved);
      setOk(sale ? "Venta actualizada." : "Venta registrada.");
      onSaved?.(saved);
    } catch (e: any) {
      setErr(e?.message || "No se pudo guardar la venta.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setErr(null);
    setOk(null);

    if (!confirm("¿Quitar la venta de este vehículo?")) return;

    setRemoving(true);
    try {
      await deleteVehicleSale(vehicleId);
      setSale(null);
      setSoldAt("");
      setSoldPrice("");
      setNotes("");
      setCustomerOpt(null);
      setLeadOpt(null);

      setOk("Venta eliminada.");
      onSaved?.(null);
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar la venta.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h5 className="card-title mb-1">Venta</h5>
            <div className="text-muted small">
              {sale ? "Este vehículo tiene una venta registrada." : "Aún no hay venta registrada para este vehículo."}
            </div>
          </div>

          {sale ? (
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={onDelete} disabled={removing}>
              {removing ? "Eliminando..." : "Eliminar venta"}
            </button>
          ) : null}
        </div>

        {err ? (
          <div className="mt-3">
            <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />
          </div>
        ) : null}

        {ok ? (
          <div className="mt-3">
            <InlineAlert type="success" message={ok} onClose={() => setOk(null)} />
          </div>
        ) : null}

        <form className="mt-3" onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                Fecha de venta <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
                required
              />
              <div className="form-text">Se guardará como fecha (sin hora) a menos que tu backend soporte hora.</div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Precio vendido</label>
              <input
                type="number"
                className="form-control"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                min={0}
                step="0.01"
                placeholder="Ej: 12500"
              />
            </div>

            <div className="col-md-12">
              <SearchSelect
                label="Cliente (opcional)"
                value={customerOpt}
                onChange={setCustomerOpt}
                loadOptions={loadCustomers}
                placeholder="Buscar cliente por nombre, teléfono o email..."
                helpText="Recomendado: asociar la venta a un cliente."
              />
            </div>

            <div className="col-md-12">
              <SearchSelect
                label="Lead (opcional)"
                value={leadOpt}
                onChange={setLeadOpt}
                loadOptions={loadLeads}
                placeholder="Buscar lead por nombre, teléfono o email..."
                helpText="Si esta venta viene de un lead, selecciónalo aquí."
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Notas</label>
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles de la venta..."
              />
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : sale ? "Guardar cambios" : "Registrar venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
