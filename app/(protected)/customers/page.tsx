"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { listCustomers, type Customer, type CustomerListMeta } from "@/lib/customers";

function IconSearch({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

export default function CustomersPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<CustomerListMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Search state
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 500);
    return () => clearTimeout(timer);
  }, [q]);

  const effectiveQ = useMemo(() => {
    const t = debouncedQ.trim();
    return t.length >= 2 ? t : undefined;
  }, [debouncedQ]);

  // Load data
  async function load(page: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listCustomers({
        page,
        limit: meta.limit,
        q: effectiveQ,
        sortBy: "createdAt",
        sortDir: "desc"
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e.message || "Error cargando clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveQ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">Clientes</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona tu base de datos de clientes y prospectos.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => load(meta.page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <IconRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
            <Link
              href="/customers/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md"
            >
              <IconPlus className="w-5 h-5" />
              Nuevo Cliente
            </Link>
          </div>
        </div>
      </div>

      {err && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{err}</div>}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconSearch className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow placeholder-slate-400"
            placeholder="Buscar por nombre, teléfono o email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Información de Contacto</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {c.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{c.fullName}</div>
                        <div className="text-xs text-slate-400">Registrado: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                          {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                          {c.phone}
                        </div>
                      )}
                      {!c.email && !c.phone && <span className="text-slate-400 italic">Sin contacto</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                    {c.documentId || <span className="text-slate-400 italic">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/customers/${c.id}`}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Detalles"
                    >
                      <IconEdit className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <IconUser className="w-12 h-12 text-slate-300 mb-2" />
                      <p>No se encontraron clientes.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Página {meta.page} de {meta.totalPages} (Total: {meta.total})</span>
            <div className="flex gap-1">
              <button
                onClick={() => load(meta.page - 1)}
                disabled={meta.page <= 1 || loading}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <IconChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => load(meta.page + 1)}
                disabled={meta.page >= meta.totalPages || loading}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <IconChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
