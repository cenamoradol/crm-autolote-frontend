"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Store = { id: string; name: string; slug: string };

function IconStore({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconAlertCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function SelectStorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<Store[]>("/sa/stores")
      .then(setStores)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function select(storeId: string) {
    const r = await fetch("/api/support/select-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId })
    });

    if (!r.ok) {
      const t = await r.text();
      setErr(t); // Show error in UI instead of alert
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <IconStore className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Elige tu Sucursal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Selecciona una tienda para gestionar su inventario y clientes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">

          {err && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">{err}</div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 animate-pulse">Cargando tiendas...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="font-medium">No se encontraron tiendas asignadas.</p>
                  <p className="text-sm mt-1">Contacta al administrador del sistema.</p>
                </div>
              ) : (
                stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => select(s.id)}
                    className="w-full text-left group relative flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1 group-hover:text-blue-600/70 transition-colors">
                        {s.slug}
                      </p>
                    </div>
                    <IconChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            CRM Autolote v1.0 &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
