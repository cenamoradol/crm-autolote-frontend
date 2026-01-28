"use client";

import { useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import SearchSelect, { type SearchOption } from "@/components/ui/SearchSelect";

type Sale = {
  id: string;
  soldAt: string;
  soldPrice: string | null;
  notes: string | null;
  soldBy?: { id: string; fullName?: string | null; email?: string | null } | null;
  customer?: { id: string; fullName: string; phone?: string | null; email?: string | null } | null;
  lead?: { id: string; fullName?: string | null; phone?: string | null; email?: string | null } | null;
};

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }
  const text = await res.text().catch(() => "");
  return { raw: text };
}

/**
 * ✅ Limpia el input a "solo números" (enteros) y lo formatea con comas.
 * - Entrada: "L 125,000.50" -> digits "12500050" (si quisiéramos decimales)
 * Aquí lo dejamos SOLO ENTEROS:
 * - "L 125,000.50" -> "125000"
 */
function sanitizeIntegerMoneyInput(raw: string): string {
  // 1) quitar todo lo que no sea dígito
  const digits = (raw ?? "").replace(/[^\d]/g, "");
  // 2) quitar ceros a la izquierda (pero permitir "0")
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  if (!trimmed) return "";
  // 3) formatear con comas
  return formatWithCommas(trimmed);
}

function formatWithCommas(digitsOnly: string): string {
  // digitsOnly: "125000" -> "125,000"
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseIntegerMoney(formatted: string): number | null {
  const digits = (formatted ?? "").replace(/[^\d]/g, "").trim();
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return n;
}

export default function VehicleSaleCard({
  vehicleId,
  sale,
  onChanged,
}: {
  vehicleId: string;
  sale: Sale | null;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [customer, setCustomer] = useState<SearchOption | null>(null);
  const [lead, setLead] = useState<SearchOption | null>(null);
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const isSold = useMemo(() => !!sale, [sale]);

  const soldPriceNumber = useMemo(() => parseIntegerMoney(soldPrice), [soldPrice]);
  const priceIsValid = useMemo(() => soldPriceNumber !== null && soldPriceNumber > 0, [soldPriceNumber]);

  async function loadCustomers(q: string): Promise<SearchOption[]> {
    const res = await fetch(`/api/bff/customers?q=${encodeURIComponent(q)}&page=1&pageSize=10`, {
      cache: "no-store",
    });

    const json = await safeJson(res);
    if (!res.ok) return [];

    const items = (json?.items || json?.data || []) as any[];
    return items.map((c) => ({
      value: c.id,
      label: c.fullName ?? c.name ?? c.email ?? c.phone ?? c.id,
      sublabel: [c.phone, c.email].filter(Boolean).join(" • "),
    }));
  }

  async function loadLeads(q: string): Promise<SearchOption[]> {
    const res = await fetch(`/api/bff/leads?q=${encodeURIComponent(q)}&page=1&limit=10`, {
      cache: "no-store",
    });

    const json = await safeJson(res);
    if (!res.ok) return [];

    const items = (json?.items || json?.data || []) as any[];
    return items.map((l) => ({
      value: l.id,
      label: l.fullName || l.email || l.phone || l.id,
      sublabel: [l.phone, l.email, l.status].filter(Boolean).join(" • "),
    }));
  }

  async function createSale() {
    setErr(null);
    setOk(null);

    // Mantengo tu regla (si la quieres): al menos Customer o Lead
    if (!customer?.value && !lead?.value) {
      setErr("Selecciona al menos un Customer o un Lead para registrar la venta.");
      return;
    }

    // ✅ Precio obligatorio
    if (!priceIsValid) {
      setErr("El precio vendido es obligatorio y debe ser mayor a 0.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId,
        customerId: customer?.value || undefined,
        leadId: lead?.value || undefined,
        soldPrice: String(soldPriceNumber), // ✅ número limpio
        notes: notes.trim() ? notes.trim() : undefined,
      };

      const res = await fetch(`/api/bff/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await safeJson(res);
      if (!res.ok) {
        throw new Error((json as any)?.message || `Error ${res.status}`);
      }

      setOk("Venta registrada. El vehículo ahora está SOLD.");
      onChanged();
    } catch (e: any) {
      setErr(e?.message || "No se pudo registrar la venta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header fw-semibold">Venta</div>
      <div className="card-body">
        {err ? <InlineAlert type="danger" message={err} onClose={() => setErr(null)} /> : null}
        {ok ? <InlineAlert type="success" message={ok} onClose={() => setOk(null)} /> : null}

        {isSold ? (
          <div>
            <div className="text-muted small">Vendido el</div>
            <div className="fw-semibold">{new Date(sale!.soldAt).toLocaleString()}</div>

            <div className="mt-2">
              <div className="text-muted small">Precio</div>
              <div className="fw-semibold">{sale!.soldPrice ?? "-"}</div>
            </div>

            {sale?.customer ? (
              <div className="mt-2">
                <div className="text-muted small">Cliente</div>
                <div className="fw-semibold">{sale.customer.fullName}</div>
                <div className="text-muted small">
                  {[sale.customer.phone, sale.customer.email].filter(Boolean).join(" • ") || ""}
                </div>
              </div>
            ) : null}

            {sale?.lead ? (
              <div className="mt-2">
                <div className="text-muted small">Lead</div>
                <div className="fw-semibold">{sale.lead.fullName ?? sale.lead.phone ?? sale.lead.email ?? "-"}</div>
                <div className="text-muted small">
                  {[sale.lead.phone, sale.lead.email].filter(Boolean).join(" • ") || ""}
                </div>
              </div>
            ) : null}

            {sale?.soldBy ? (
              <div className="mt-2">
                <div className="text-muted small">Vendido por</div>
                <div className="fw-semibold">{sale.soldBy.fullName ?? sale.soldBy.email ?? "-"}</div>
              </div>
            ) : null}

            {sale?.notes ? (
              <div className="mt-2">
                <div className="text-muted small">Notas</div>
                <div>{sale.notes}</div>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="text-muted mb-3">Registrar venta (esto marcará el vehículo como SOLD).</div>

            <SearchSelect
              label="Customer (opcional)"
              value={customer}
              onChange={setCustomer}
              loadOptions={loadCustomers}
              placeholder="Buscar customer por nombre/teléfono/email..."
              disabled={loading}
              hint="Escribe para buscar. Puedes dejarlo vacío si usarás Lead."
            />

            <SearchSelect
              label="Lead (opcional)"
              value={lead}
              onChange={setLead}
              loadOptions={loadLeads}
              placeholder="Buscar lead por nombre/teléfono/email..."
              disabled={loading}
              hint="Escribe para buscar. Puedes dejarlo vacío si usarás Customer."
            />

            <div className="mb-3">
              <label className="form-label">
                Precio vendido <span className="text-danger">*</span>
              </label>
              <input
                className={`form-control ${soldPrice.length > 0 && !priceIsValid ? "is-invalid" : ""}`}
                value={soldPrice}
                onChange={(e) => setSoldPrice(sanitizeIntegerMoneyInput(e.target.value))}
                placeholder="Ej: 125,000"
                disabled={loading}
                inputMode="numeric"
              />
              <div className="form-text">Obligatorio. Solo números (puedes pegar con símbolos y comas).</div>
              {soldPrice.length > 0 && !priceIsValid ? (
                <div className="invalid-feedback">Ingresa un número mayor a 0.</div>
              ) : null}
            </div>

            <div className="mb-3">
              <label className="form-label">Notas</label>
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                placeholder="Ej: pago contado, se entregó en sucursal, etc."
              />
            </div>

            <button className="btn btn-primary" onClick={createSale} disabled={loading || !priceIsValid}>
              {loading ? "Guardando..." : "Guardar venta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
