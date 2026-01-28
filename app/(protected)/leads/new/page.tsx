"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LeadForm from "@/components/leads/LeadForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { createLead } from "@/lib/leads";

function safeDecode(v: string | null): string | null {
  if (!v) return null;
  try {
    const d = decodeURIComponent(v);
    return d.startsWith("/") ? d : null;
  } catch {
    return null;
  }
}

export default function LeadCreatePage() {
  const sp = useSearchParams();
  const [ok, setOk] = useState<string | null>(null);

  const returnTo = useMemo(() => safeDecode(sp.get("returnTo")) ?? "/leads", [sp]);

  return (
    <div className="row g-3">
      {ok && (
        <div className="col-12">
          <InlineAlert type="success" message={ok} onClose={() => setOk(null)} />
        </div>
      )}

      <div className="col-12">
        <LeadForm
          mode="create"
          submitLabel="Crear"
          backHref={returnTo}
          onSubmit={async (data) => {
            const created = await createLead(data);
            setOk("Lead creado ✅");
            window.location.href = `/leads/${created.id}?returnTo=${encodeURIComponent(returnTo)}`;
          }}
        />
      </div>
    </div>
  );
}
