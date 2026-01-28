"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import ActivityForm from "@/components/activities/ActivityForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { createActivity } from "@/lib/activities";

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

export default function ActivityCreatePage() {
  const sp = useSearchParams();

  const leadId = sp.get("leadId") ?? "";
  const customerId = sp.get("customerId") ?? "";
  const vehicleId = sp.get("vehicleId") ?? "";

  // ✅ returnTo manda, backTo legacy
  const directReturnTo = useMemo(
    () => safeDecode(sp.get("returnTo")) ?? safeDecode(sp.get("backTo")),
    [sp]
  );

  const returnTo = useMemo(() => {
    if (directReturnTo) return directReturnTo;

    // fallback: listado filtrado por contexto si existe
    if (leadId || customerId || vehicleId) {
      const qs = new URLSearchParams();
      if (leadId) qs.set("leadId", leadId);
      if (customerId) qs.set("customerId", customerId);
      if (vehicleId) qs.set("vehicleId", vehicleId);
      return `/activities?${qs.toString()}`;
    }

    return "/activities";
  }, [directReturnTo, leadId, customerId, vehicleId]);

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
        <ActivityForm
          mode="create"
          submitLabel="Registrar"
          backHref={returnTo}
          preset={{
            leadId: leadId || undefined,
            customerId: customerId || undefined,
            vehicleId: vehicleId || undefined
          }}
          onSubmit={async (payload) => {
            try {
              await createActivity(payload);
              setOk("Actividad registrada ✅");
              window.location.href = returnTo; // ✅ siempre vuelve al returnTo
            } catch (e: any) {
              setErr(e?.message || "No se pudo registrar la actividad");
            }
          }}
        />
      </div>
    </div>
  );
}
