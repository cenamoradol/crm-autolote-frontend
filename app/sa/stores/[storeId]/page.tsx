"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type StoreDetail = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  logoUrl: string | null;
  domains?: { id: string; domain: string; isPrimary: boolean }[];
  branches?: { id: string; name: string; address: string | null; isPrimary: boolean }[];
  members?: {
    userId: string;
    email: string;
    fullName: string | null;
    roles: { key: string; name: string }[];
  }[];
};

export default function StoreDetailPage({
  params
}: {
  params: Promise<{ storeId: string }> | { storeId: string };
}) {
  // ✅ Next 16/Turbopack: params puede venir como Promise
  const resolved = (typeof (params as any)?.then === "function" ? use(params as Promise<{ storeId: string }>) : params) as {
    storeId: string;
  };

  const storeId = resolved.storeId;

  const [data, setData] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [supporting, setSupporting] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiFetch<StoreDetail>(`/sa/stores/${storeId}`);
      setData(d);
    } catch (e: any) {
      setErr(e.message || "Error cargando store");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const primaryDomain = useMemo(() => {
    const d = data?.domains?.find((x) => x.isPrimary);
    return d?.domain ?? null;
  }, [data]);

  // --- Domain Logic ---
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newDomainPrimary, setNewDomainPrimary] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);

  async function onAddDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain) return;
    setSavingDomain(true);
    try {
      await apiFetch(`/sa/stores/${storeId}/domains`, {
        method: "POST",
        body: JSON.stringify({ domain: newDomain, isPrimary: newDomainPrimary })
      });
      setAddingDomain(false);
      setNewDomain("");
      setNewDomainPrimary(false);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSavingDomain(false);
    }
  }

  async function onDeleteDomain(domainId: string) {
    if (!confirm("¿Eliminar este dominio?")) return;
    try {
      await apiFetch(`/sa/stores/${storeId}/domains/${domainId}`, {
        method: "DELETE"
      });
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  // --- Branch Logic ---
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", isPrimary: false });
  const [savingBranch, setSavingBranch] = useState(false);

  function openNewBranch() {
    setEditingBranchId(null);
    setBranchForm({ name: "", address: "", isPrimary: false });
    setBranchModalOpen(true);
  }

  function openEditBranch(b: any) {
    setEditingBranchId(b.id);
    setBranchForm({
      name: b.name,
      address: b.address || "",
      isPrimary: b.isPrimary
    });
    setBranchModalOpen(true);
  }

  async function onSaveBranch(e: React.FormEvent) {
    e.preventDefault();
    setSavingBranch(true);
    try {
      if (editingBranchId) {
        await apiFetch(`/sa/stores/${storeId}/branches/${editingBranchId}`, {
          method: "PATCH",
          body: JSON.stringify(branchForm)
        });
      } else {
        await apiFetch(`/sa/stores/${storeId}/branches`, {
          method: "POST",
          body: JSON.stringify(branchForm)
        });
      }
      setBranchModalOpen(false);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSavingBranch(false);
    }
  }

  async function onDeleteBranch(branchId: string) {
    if (!confirm("¿Eliminar esta sucursal?")) return;
    try {
      await apiFetch(`/sa/stores/${storeId}/branches/${branchId}`, {
        method: "DELETE"
      });
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  // --- End Logic ---

  async function enterSupportMode() {
    setSupporting(true);
    setErr(null);
    try {
      const r = await fetch("/api/support/select-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId })
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "No se pudo seleccionar store");
      }

      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setSupporting(false);
    }
  }

  const [editingStore, setEditingStore] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    isActive: true,
    logoUrl: ""
  });

  function openEdit() {
    if (!data) return;
    setEditForm({
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
      logoUrl: data.logoUrl || ""
    });
    setEditingStore(true);
  }

  async function onUpdateStore(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    setUpdating(true);
    setErr(null);
    try {
      await apiFetch<StoreDetail>(`/sa/stores/${storeId}`, {
        method: "PATCH",
        body: JSON.stringify(editForm)
      });
      setEditingStore(false);
      await load(); // Reload all data
    } catch (e: any) {
      setErr(e.message || "Error al actualizar");
    } finally {
      setUpdating(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex animate-pulse flex-col space-y-4">
        <div className="h-12 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-48 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-48 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="h-64 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="p-12 text-center">
          {err ? (
            <InlineAlert message={err} onClose={() => setErr(null)} />
          ) : (
            <div className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Sin datos disponibles</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{data.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Slug: <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-700 dark:text-slate-200">{data.slug}</code>
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${data.isActive
                    ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                    : "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20"
                    }`}>
                    {data.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                onClick={openEdit}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Editar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                onClick={load}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {loading ? "Refrescando..." : "Refrescar"}
              </button>
              <LoadingButton
                loading={supporting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                onClick={enterSupportMode}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                Entrar en modo soporte
              </LoadingButton>
            </div>
          </div>

          {primaryDomain && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-500">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A.5.5 0 009 7.659V12a1 1 0 102 0V7.659a.5.5 0 00-.555-.491zM9 14.5a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                </svg>
                Dominio primario activo: <code className="font-semibold text-blue-600 dark:text-blue-400">{primaryDomain}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {err && (
        <InlineAlert message={err} onClose={() => setErr(null)} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Domains List */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-indigo-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
              Dominios
            </h2>
            <button
              onClick={() => setAddingDomain(true)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 transition-colors"
              title="Añadir Dominio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {addingDomain && (
              <form onSubmit={onAddDomain} className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex gap-2 mb-2">
                  <input
                    autoFocus
                    className="flex-1 rounded border-slate-300 py-1 px-2 text-sm"
                    placeholder="ejemplo.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="primaryCheck"
                      checked={newDomainPrimary}
                      onChange={(e) => setNewDomainPrimary(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="primaryCheck" className="text-xs text-slate-600">Primario</label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setAddingDomain(false)} className="text-xs px-2 py-1 text-slate-500">Cancelar</button>
                  <LoadingButton loading={savingDomain} type="submit" className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Guardar</LoadingButton>
                </div>
              </form>
            )}

            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {(data.domains ?? []).map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.domain}</code>
                    {d.isPrimary && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                        Primario
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteDomain(d.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                    title="Eliminar dominio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
              {(data.domains ?? []).length === 0 && !addingDomain && (
                <li className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight uppercase">Sin dominios registrados</li>
              )}
            </ul>
          </div>
        </div>

        {/* Branches List */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-indigo-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z" />
              </svg>
              Sucursales (Branches)
            </h2>
            <button
              onClick={openNewBranch}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 transition-colors"
              title="Añadir Sucursal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {(data.branches ?? []).map((b) => (
                <li key={b.id} className="py-3 group relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{b.name}</span>
                        {b.isPrimary && (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                            Principal
                          </span>
                        )}
                      </div>
                      {b.address && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase">{b.address}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditBranch(b)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteBranch(b.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {(data.branches ?? []).length === 0 && (
                <li className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight uppercase">Sin sucursales registradas</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z" />
            </svg>
            Usuarios asignados
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
              {(data.members ?? []).map((m) => (
                <tr key={m.userId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white uppercase tracking-tight">
                    {m.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium uppercase tracking-tight">
                    {m.fullName ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium uppercase tracking-tight">
                    <div className="flex flex-wrap gap-1">
                      {(m.roles ?? []).map((r) => (
                        <span key={r.key} className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {r.key}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {(data.members ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight uppercase">
                    No hay usuarios asignados a esta tienda.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 dark:bg-slate-900/30 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5 leading-relaxed uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-indigo-500">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            Tip: Para gestionar el acceso, ve a <Link href="/sa/users" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">SA → Users</Link> y usa la función de asignar a tienda.
          </p>

        </div>
      </div>
      {/* Edit Store Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Editar Tienda</h3>
              <button
                onClick={() => setEditingStore(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onUpdateStore} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nombre
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={editForm.name}
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Slug
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={editForm.slug}
                  onChange={(e) => setEditForm(p => ({ ...p, slug: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Logo URL
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={editForm.logoUrl}
                  onChange={(e) => setEditForm(p => ({ ...p, logoUrl: e.target.value }))}
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                />
                <label htmlFor="editIsActive" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tienda Activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStore(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <LoadingButton
                  loading={updating}
                  className="flex-1 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none"
                  type="submit"
                >
                  Guardar Cambios
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Branch Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                {editingBranchId ? "Editar Sucursal" : "Nueva Sucursal"}
              </h3>
              <button
                onClick={() => setBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onSaveBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nombre de la Sucursal
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Principal, Norte, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Dirección
                </label>
                <textarea
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Dirección completa"
                  rows={3}
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="branchPrimary"
                  checked={branchForm.isPrimary}
                  onChange={(e) => setBranchForm(p => ({ ...p, isPrimary: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                />
                <label htmlFor="branchPrimary" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Es Sucursal Principal
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <LoadingButton
                  loading={savingBranch}
                  className="flex-1 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none"
                  type="submit"
                >
                  Guardar
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
