"use client";

import { useState } from "react";
import CustomerForm from "@/components/customers/CustomerForm";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { createCustomer } from "@/lib/customers";

export default function CustomerCreatePage() {
  const [ok, setOk] = useState<string | null>(null);

  return (
    <div className="row g-3">
      {ok && (
        <div className="col-12">
          <InlineAlert type="success" message={ok} onClose={() => setOk(null)} />
        </div>
      )}

      <div className="col-12">
        <CustomerForm
          mode="create"
          submitLabel="Crear"
          onSubmit={async (data) => {
            const created = await createCustomer(data);
            setOk("Customer creado ✅");
            window.location.href = `/customers/${created.id}`;
          }}
        />
      </div>
    </div>
  );
}
