"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";
import SearchSelectTW from "@/components/common/SearchSelectTW";
import { searchCustomers, searchLeads } from "@/lib/lookups";
import { quickSellVehicle, type QuickSaleResult } from "@/lib/vehicles";

export type QuickSaleModalVehicle = {
  id: string;
  title?: string | null;
  publicId?: string;
  brand?: { name?: string };
  model?: { name?: string };
  year?: number | null;
  price?: string | number | null;
  offerPrice?: string | number | null;
  clearancePrice?: string | number | null;
};

export interface QuickSaleModalProps {
  vehicle: QuickSaleModalVehicle | null;
  onClose: () => void;
  onSuccess: (sale: QuickSaleResult) => void;
}

function formatPriceLike(v: any, currencySymbol?: string): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "—";
  return `${currencySymbol || ""}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function suggestedPrice(v: QuickSaleModalVehicle): number | null {
  const candidates = [v.clearancePrice, v.offerPrice, v.price];
  for (const c of candidates) {
    if (c === null || c === undefined || c === "") continue;
    const n = typeof c === "string" ? Number(c) : c;
    if (Number.isFinite(n) && n > 0) return Number(n);
  }
  return null;
}

export function QuickSaleModal({ vehicle, onClose, onSuccess }: QuickSaleModalProps) {
  const user = useUser();
  const currencySymbol = user.currencySymbol;

  const [soldPrice, setSoldPrice] = useState<string>("");
  const [customer, setCustomer] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [skipCustomerConfirm, setSkipCustomerConfirm] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    setSoldPrice("");
    setCustomer(null);
    setLead(null);
    setNotes("");
    setErr(null);
    setSkipCustomerConfirm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const suggested = suggestedPrice(vehicle);
  const priceNum = Number(soldPrice.toString().replace(/[^0-9.]/g, ""));
  const priceIsValid = Number.isFinite(priceNum) && priceNum > 0;

  async function submit() {
    if (!priceIsValid) {
      setErr("El precio vendido es obligatorio y debe ser mayor a 0.");
      return;
    }
    if (!customer?.value && !lead?.value && !skipCustomerConfirm) {
      setSkipCustomerConfirm(true);
      setErr("Vas a registrar una venta rápida SIN cliente ni lead asignado. Pulsa Confirmar otra vez para continuar.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const sale = await quickSellVehicle(vehicle!.id, {
        soldPrice: priceNum,
        customerId: customer?.value || undefined,
        leadId: lead?.value || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess(sale);
    } catch (e: any) {
      const msg = e?.message || "No se pudo registrar la venta rápida";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  const summaryLine = [
    vehicle.title || [vehicle.brand?.name, vehicle.model?.name].filter(Boolean).join(" ") || vehicle.publicId,
    vehicle.year ? `· ${vehicle.year}` : "",
    vehicle.publicId ? `· ID ${vehicle.publicId}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Venta rápida</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{summaryLine || "Vehículo"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Cerrar"
            disabled={loading}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            Esto marcará el vehículo como <strong>VENDIDO</strong> y lo despublicará del sitio público.
            No se requiere asociar un cliente, pero puedes hacerlo si lo conoces.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Precio vendido <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm pointer-events-none">
                {currencySymbol || "$"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                placeholder={suggested ? `Sugerido: ${formatPriceLike(suggested, currencySymbol)}` : "0.00"}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <SearchSelectTW
              label="Cliente (opcional)"
              value={customer}
              onChange={(v) => {
                setCustomer(v);
                if (v) setLead(null);
              }}
              loadOptions={searchCustomers}
              placeholder="Buscar cliente por nombre, teléfono o email…"
            />
          </div>

          <div>
            <SearchSelectTW
              label="Lead (opcional)"
              value={lead}
              onChange={(v) => {
                setLead(v);
                if (v) setCustomer(null);
              }}
              loadOptions={searchLeads}
              placeholder="Buscar lead…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Notas (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Venta en patio, pago en efectivo…"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          {err && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {err}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading || !priceIsValid}
            className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            {skipCustomerConfirm ? "Confirmar de todos modos" : "Confirmar venta rápida"}
          </button>
        </div>
      </div>
    </div>
  );
}
