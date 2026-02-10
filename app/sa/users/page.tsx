"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type User = {
  id: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  store: { id: string; name: string; slug: string } | null;
};

type Store = {
  id: string;
  name: string;
  slug: string;
};

type CreateUserBody = {
  email: string;
  password: string;
  fullName?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
};

type AssignBody = {
  userId: string;
  roleKeys: string[];
};

const ROLE_OPTIONS = [
  { key: "admin", label: "Admin" },
  { key: "supervisor", label: "Supervisor" },
  { key: "seller", label: "Seller" }
];

export default function SaUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterStoreId, setFilterStoreId] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserBody>({
    email: "",
    password: "Password123!",
    fullName: "",
    isSuperAdmin: false,
    isActive: true
  });

  const [assignStoreId, setAssignStoreId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoles, setAssignRoles] = useState<string[]>([]);

  // User Editing State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    isActive: true,
    isSuperAdmin: false,
    password: ""
  });

  const canCreate = useMemo(() => {
    return createForm.email.includes("@") && createForm.password.length >= 6;
  }, [createForm]);

  const canAssign = useMemo(() => {
    return !!assignStoreId && !!assignUserId;
  }, [assignStoreId, assignUserId]);

  function changeCreate<K extends keyof CreateUserBody>(key: K, value: CreateUserBody[K]) {
    setCreateForm((p) => ({ ...p, [key]: value }));
  }

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      // First load stores to populate filters/selects
      const s = await apiFetch<Store[]>("/sa/stores");
      setStores(s);

      // Then load users with filter
      let url = "/sa/users";
      if (filterStoreId) {
        url += `?storeId=${filterStoreId}`;
      }
      const u = await apiFetch<User[]>(url);
      setUsers(u);

      // defaults amigables
      if (!assignStoreId && s.length) setAssignStoreId(s[0].id);
      if (!assignUserId && u.length) setAssignUserId(u[0].id);
    } catch (e: any) {
      setErr(e.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  // Sincronizar roles cuando cambie la selección de store/user en el formulario de asignación
  useEffect(() => {
    if (assignStoreId && assignUserId) {
      const syncRoles = async () => {
        try {
          const members = await apiFetch<any[]>(`/sa/stores/${assignStoreId}/members`);
          const member = members.find(m => m.user.id === assignUserId);
          if (member) {
            setAssignRoles(member.roles.map((r: any) => r.key));
          } else {
            setAssignRoles([]);
          }
        } catch (e) {
          console.error("Error syncing roles:", e);
        }
      };
      syncRoles();
    }
  }, [assignStoreId, assignUserId]);

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setSavingUser(true);
    setErr(null);
    setOk(null);
    try {
      await apiFetch("/sa/users", {
        method: "POST",
        body: JSON.stringify(createForm)
      });

      setOk("Usuario creado ✅");
      setCreateForm({
        email: "",
        password: "Password123!",
        fullName: "",
        isSuperAdmin: false,
        isActive: true
      });

      await loadAll();
    } catch (e: any) {
      setErr(e.message || "Error creando usuario");
    } finally {
      setSavingUser(false);
    }
  }

  function toggleRole(roleKey: string) {
    setAssignRoles((prev) => {
      if (prev.includes(roleKey)) return prev.filter((r) => r !== roleKey);
      return [...prev, roleKey];
    });
  }

  async function onAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!canAssign) return;

    setAssigning(true);
    setErr(null);
    setOk(null);
    try {
      const body: AssignBody = {
        userId: assignUserId,
        roleKeys: assignRoles
      };

      await apiFetch(`/sa/stores/${assignStoreId}/members/assign`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      setOk("Asignación realizada ✅");
    } catch (e: any) {
      setErr(e.message || "Error asignando roles");
    } finally {
      setAssigning(false);
    }
  }

  // Edit User Modal logic
  function openEdit(user: User) {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      password: ""
    });
  }

  async function onUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setErr(null);
    try {
      const body: any = {
        fullName: editForm.fullName,
        isActive: editForm.isActive,
        isSuperAdmin: editForm.isSuperAdmin
      };
      if (editForm.password.trim()) {
        body.password = editForm.password.trim();
      }

      await apiFetch(`/sa/users/${editingUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(body)
      });

      setOk("Usuario actualizado ✅");
      setEditingUser(null);
      await loadAll();
    } catch (e: any) {
      setErr(e.message || "Error actualizando");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Forms Column */}
        <div className="w-full space-y-6 lg:w-[400px] flex-shrink-0">
          {/* Create User Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.625 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Crear Usuario</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios master o para tiendas.</p>
                </div>
              </div>

              {(err || ok) && (
                <div className="mb-4">
                  <InlineAlert
                    type={err ? "danger" : "success"}
                    message={err ?? ok ?? ""}
                    onClose={() => {
                      setErr(null);
                      setOk(null);
                    }}
                  />
                </div>
              )}

              <form onSubmit={onCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                    value={createForm.email}
                    onChange={(e) => changeCreate("email", e.target.value)}
                    placeholder="ejemplo@autolote.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={createForm.password}
                    onChange={(e) => changeCreate("password", e.target.value)}
                  />
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 uppercase italic">Recomendado: Password123!</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Nombre completo
                  </label>
                  <input
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                    value={createForm.fullName ?? ""}
                    onChange={(e) => changeCreate("fullName", e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActiveUser"
                      checked={createForm.isActive}
                      onChange={(e) => changeCreate("isActive", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <label htmlFor="isActiveUser" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Usuario activo
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSuperAdmin"
                      checked={createForm.isSuperAdmin}
                      onChange={(e) => changeCreate("isSuperAdmin", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <label htmlFor="isSuperAdmin" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Es SuperAdmin <span className="text-[10px] font-bold text-indigo-500">(MASTER)</span>
                    </label>
                  </div>
                </div>

                <LoadingButton
                  loading={savingUser}
                  className={`flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${!canCreate ? "opacity-50 cursor-not-allowed" : ""}`}
                  type="submit"
                  disabled={!canCreate}
                >
                  Confirmar y Crear
                </LoadingButton>
              </form>
            </div>
          </div>

          {/* Assign to Store Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Asignar a Tienda</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vínculo usuario → store</p>
                </div>
              </div>

              <form onSubmit={onAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Store
                  </label>
                  <select
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={assignStoreId}
                    onChange={(e) => setAssignStoreId(e.target.value)}
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Usuario
                  </label>
                  <select
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} {u.isSuperAdmin ? "(SA)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Roles en esta Tienda
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => toggleRole(r.key)}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-tight ring-1 ring-inset transition-all ${assignRoles.includes(r.key)
                          ? "bg-indigo-600 text-white ring-indigo-600"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700"
                          }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <LoadingButton
                  loading={assigning}
                  className={`flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 ${!canAssign ? "opacity-50 cursor-not-allowed" : ""}`}
                  type="submit"
                  disabled={!canAssign}
                >
                  Confirmar Roles
                </LoadingButton>
              </form>
            </div>
          </div>
        </div>

        {/* Users Table Column */}
        <div className="flex-1 min-w-0">
          <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="border-b border-slate-200 bg-white px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Directorio de Usuarios</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total: <span className="font-bold">{users.length}</span> registros.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="block rounded-lg border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
                    value={filterStoreId}
                    onChange={(e) => setFilterStoreId(e.target.value)}
                  >
                    <option value="">Todas las Stores</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => loadAll()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    {loading ? "Actualizando..." : "Refrescar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Store</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">SA</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Estado</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!u.isActive ? "opacity-50 grayscale bg-slate-50 dark:bg-slate-900/50" : ""}`}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-indigo-400 uppercase tracking-tight">{u.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium uppercase">{u.fullName ?? "-"}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {u.store ? (
                          <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 dark:text-white">{u.store.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{u.store.slug}</span>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm(`¿Desvincular a ${u.email} de la tienda ${u.store!.name}?`)) return;
                                try {
                                  setLoading(true);
                                  await apiFetch(`/sa/stores/${u.store!.id}/members/${u.id}`, { method: "DELETE" });
                                  setOk("Usuario desvinculado de la tienda ✅");
                                  await loadAll();
                                } catch (err: any) {
                                  setErr(err.message || "Error al desvincular usuario");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-all"
                              title="Desvincular de Store"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        {u.isSuperAdmin ? (
                          <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700 uppercase ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-700/30">
                            Sí
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${u.isActive
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-500/20"
                          : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400"
                          }`}>
                          {u.isActive ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold uppercase text-[10px] tracking-widest transition-colors"
                        >
                          Gestionar
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm(`¿ELIMINAR PERMANENTEMENTE al usuario ${u.email}? Esta acción es irreversible.`)) return;
                            try {
                              setLoading(true);
                              await apiFetch(`/sa/users/${u.id}`, { method: "DELETE" });
                              setOk("Usuario eliminado permanentemente ✅");
                              await loadAll();
                            } catch (err: any) {
                              setErr(err.message || "Error eliminando usuario");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">No hay usuarios registrados.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:bg-slate-900/30 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 italic dark:text-slate-500 uppercase tracking-tight">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-500">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                Gestión de usuarios: Editar nombre, estado, permisos globales y cambiar contraseña.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Editar Usuario</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onUpdateUser} className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{editingUser.email}</div>
                <p className="text-[10px] text-slate-500 uppercase font-medium">Editando perfil global</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nombre completo
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nueva Contraseña <span className="text-[9px] lowercase italic font-normal text-slate-400">(Opcional)</span>
                </label>
                <input
                  type="password"
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={editForm.password}
                  onChange={(e) => setEditForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label htmlFor="editIsActive" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Usuario activo
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsSuperAdmin"
                    checked={editForm.isSuperAdmin}
                    onChange={(e) => setEditForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label htmlFor="editIsSuperAdmin" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Es SuperAdmin <span className="text-[10px] font-bold text-indigo-500">(Master)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
    </div>
  );
}
