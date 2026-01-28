"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Store = { id: string; name: string; slug: string };

export default function SelectStorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Store[]>("/sa/stores")
      .then(setStores)
      .catch((e) => setErr(e.message));
  }, []);

  async function select(storeId: string) {
    const r = await fetch("/api/support/select-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId })
    });

    if (!r.ok) {
      const t = await r.text();
      alert(t);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Elegir Store (Soporte)</h5>
        <p className="text-muted">
          Selecciona una store para operar inventario/leads/etc desde el dominio master.
        </p>

        {err && <div className="alert alert-danger">{err}</div>}

        <ul className="list-group">
          {stores.map((s) => (
            <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{s.name}</div>
                <small className="text-muted">{s.slug}</small>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => select(s.id)}>
                Seleccionar
              </button>
            </li>
          ))}
          {stores.length === 0 && <li className="list-group-item text-muted">Sin datos</li>}
        </ul>
      </div>
    </div>
  );
}
