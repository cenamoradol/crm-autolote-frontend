"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import VehicleForm from "@/components/inventory/VehicleForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { createVehicle } from "@/lib/vehicles";

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v).trim();
    if (!d.startsWith("/") || d.startsWith("//")) return null;
    return d;
  } catch {
    return null;
  }
}

export default function VehicleCreatePage() {
  const sp = useSearchParams();
  const returnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? "/inventory", [sp]);

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="row g-3">
      {(ok || err) && (
        <div className="col-12">
          <InlineAlert
            type={err ? "danger" : "success"}
            message={err ?? ok ?? ""}
            onClose={() => {
              setOk(null);
              setErr(null);
            }}
          />
        </div>
      )}

      <div className="col-12">
        <VehicleForm
          submitLabel="Crear"
          onCancel={() => {
            window.location.href = returnTo;
          }}
          onSubmit={async (payload) => {
            try {
              const created = await createVehicle(payload);
              setOk("Vehículo creado ✅");
              window.location.href = `/inventory/${created.id}?returnTo=${encodeURIComponent(returnTo)}`;
            } catch (e: any) {
              setErr(e?.message || "No se pudo crear");
            }
          }}
        />
      </div>
    </div>
  );
}
