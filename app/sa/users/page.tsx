"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { LoadingButton } from "@/components/ui/LoadingButton";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

type User = {
  id: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  store: { id: string; name: string; slug: string } | null;
};

type PermissionSet = {
  id: string;
  storeId: string;
  name: string;
  permissions: any;
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

// --- Icons ---
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

function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconStore({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

const MODULES = [
  {
    key: "sales",
    label: "Ventas",
    actions: ["read", "create", "update", "delete", "approve"],
  },
  {
    key: "inventory",
    label: "Inventario",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "customers",
    label: "Clientes",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "leads",
    label: "Leads",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "consignors",
    label: "Consignatarios",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "activities",
    label: "Actividades",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "reports",
    label: "Reportes",
    actions: ["read"],
  },
  {
    key: "store_settings",
    label: "Configuración",
    actions: ["read", "update"],
  },
  {
    key: "billing",
    label: "Facturación",
    actions: ["read", "update"],
  },
  {
    key: "dashboard",
    label: "Dashboard",
    actions: ["read"],
  },
];

export default function SaUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterStoreId, setFilterStoreId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [savingSet, setSavingSet] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
  const [showSetManager, setShowSetManager] = useState(false);
  const [editingSet, setEditingSet] = useState<PermissionSet | null>(null);
  const [setForm, setSetForm] = useState({ name: "", permissions: {} as any });


  const [createForm, setCreateForm] = useState<CreateUserBody>({
    email: "",
    password: "Password123!",
    fullName: "",
    isSuperAdmin: false,
    isActive: true
  });

  const [assignStoreId, setAssignStoreId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignPermissionSetId, setAssignPermissionSetId] = useState("");
  const [assignPermissions, setAssignPermissions] = useState<Record<string, string[]>>({});
  const [isDirectOverride, setIsDirectOverride] = useState(false);

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
    try {
      const s = await apiFetch<Store[]>("/sa/stores");
      setStores(s);

      let url = "/sa/users";
      if (filterStoreId) {
        url += `?storeId=${filterStoreId}`;
      }
      const u = await apiFetch<User[]>(url);
      setUsers(u);

      if (filterStoreId) {
        const pSets = await apiFetch<PermissionSet[]>(`/sa/permission-sets?storeId=${filterStoreId}`);
        setPermissionSets(pSets);
      } else {
        setPermissionSets([]);
      }

      if (!assignStoreId && s.length) setAssignStoreId(s[0].id);
      if (!assignUserId && u.length) setAssignUserId(u[0].id);
    } catch (e: any) {
      toast.error(e.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  async function loadSets(storeId: string) {
    try {
      const pSets = await apiFetch<PermissionSet[]>(`/sa/permission-sets?storeId=${storeId}`);
      setPermissionSets(pSets);
    } catch (e: any) {
      toast.error(e.message || "Error cargando grupos");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStoreId]);

  useEffect(() => {
    if (showAssignModal && assignStoreId && assignUserId) {
      const loadMemberData = async () => {
        try {
          const members = await apiFetch<any[]>(`/sa/stores/${assignStoreId}/members`);
          const member = members.find(m => m.user.id === assignUserId);
          if (member) {
            setAssignPermissions(member.permissions || {});
            setAssignPermissionSetId(member.permissionSetId || "");
            const hasDirectPerms = !!member.permissions && Object.keys(member.permissions).length > 0;
            setIsDirectOverride(hasDirectPerms && !member.permissionSetId);
          } else {
            setAssignPermissions({});
            setAssignPermissionSetId("");
            setIsDirectOverride(false);
          }
          loadSets(assignStoreId);
        } catch (e: any) {
          toast.error(e.message || "Error cargando asignación");
        }
      };
      loadMemberData();
    } else if (!showAssignModal) {
      setAssignPermissions({});
      setAssignPermissionSetId("");
      setIsDirectOverride(false);
    }
  }, [showAssignModal, assignStoreId, assignUserId]);

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setSavingUser(true);
    try {
      await apiFetch("/sa/users", {
        method: "POST",
        body: JSON.stringify(createForm)
      });

      toast.success("Usuario creado con éxito");
      setCreateForm({
        email: "",
        password: "Password123!",
        fullName: "",
        isSuperAdmin: false,
        isActive: true
      });

      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Error creando usuario");
    } finally {
      setSavingUser(false);
    }
  }

  function togglePermission(module: string, action: string) {
    setAssignPermissions((prev) => {
      const currentActions = prev[module] || [];
      const newActions = currentActions.includes(action)
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];

      const newPerms = { ...prev };
      if (newActions.length === 0) {
        delete newPerms[module];
      } else {
        newPerms[module] = newActions;
      }
      return newPerms;
    });
  }

  async function onAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!canAssign) return;

    setAssigning(true);
    try {
      const body = {
        userId: assignUserId,
        permissions: isDirectOverride ? assignPermissions : null,
        permissionSetId: assignPermissionSetId || null
      };

      await apiFetch(`/sa/stores/${assignStoreId}/members/assign`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      toast.success("Asignación actualizada ✅");
    } catch (e: any) {
      toast.error(e.message || "Error asignando permisos");
    } finally {
      setAssigning(false);
    }
  }

  async function onAssignStore(e: React.FormEvent) {
    e.preventDefault();
    if (!assignStoreId || !assignUserId) return;

    setAssigning(true);
    try {
      await apiFetch(`/sa/stores/${assignStoreId}/members/assign`, {
        method: "POST",
        body: JSON.stringify({
          userId: assignUserId,
          permissions: {},
        })
      });

      toast.success("Tienda asignada correctamente");
      setShowStoreModal(false);
      setAssignUserId("");
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Error al asignar la tienda");
    } finally {
      setAssigning(false);
    }
  }

  async function handleExport() {
    if (!filteredUsers || filteredUsers.length === 0) return;
    setExporting(true);
    try {
      const dataToExport = filteredUsers.map(u => ({
        "ID": u.id,
        "Nombre Completo": u.fullName || "Sin nombre",
        "Email": u.email,
        "Usuario Maestro": u.isSuperAdmin ? "Sí" : "No",
        "Tienda Asignada": u.store ? u.store.name : "No asignado",
        "Slug Tienda": u.store ? u.store.slug : "N/A",
        "Estado": u.isActive ? "Activo" : "Suspendido"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

      XLSX.writeFile(workbook, `Usuarios_${new Date().toISOString().split('T')[0]}.csv`, { bookType: "csv" });
      toast.success("Exportación completada");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar datos");
    } finally {
      setExporting(false);
    }
  }

  async function onSaveSet(e: React.FormEvent) {
    e.preventDefault();
    if (!setForm.name || !assignStoreId) return;

    setSavingSet(true);
    try {
      if (editingSet) {
        await apiFetch(`/sa/permission-sets/${editingSet.id}`, {
          method: "PATCH",
          body: JSON.stringify(setForm)
        });
      } else {
        await apiFetch(`/sa/permission-sets`, {
          method: "POST",
          body: JSON.stringify({ ...setForm, storeId: assignStoreId })
        });
      }
      toast.success("Conjunto guardado ✅");
      setSetForm({ name: "", permissions: {} });
      setEditingSet(null);
      loadSets(assignStoreId);
    } catch (e: any) {
      toast.error(e.message || "Error guardando conjunto");
    } finally {
      setSavingSet(false);
    }
  }

  const effectivePermissions = useMemo(() => {
    if (isDirectOverride) return assignPermissions;
    const selectedSet = permissionSets.find(s => s.id === assignPermissionSetId);
    return selectedSet?.permissions || {};
  }, [isDirectOverride, assignPermissions, assignPermissionSetId, permissionSets]);

  const targetUser = useMemo(() => users.find(u => u.id === assignUserId), [users, assignUserId]);
  const targetStore = useMemo(() => stores.find(s => s.id === assignStoreId), [stores, assignStoreId]);

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
    try {
      const body: any = {
        fullName: editForm.fullName,
        isActive: editForm.isActive,
        isSuperAdmin: editForm.isSuperAdmin
      };
      if (editForm.password.trim()) body.password = editForm.password.trim();

      await apiFetch(`/sa/users/${editingUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(body)
      });
      toast.success("Actualizado ✅");
      setEditingUser(null);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchTerm ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = !filterStoreId || u.store?.id === filterStoreId;
      return matchesSearch && matchesStore;
    });
  }, [users, searchTerm, filterStoreId]);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">Usuarios</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Directorio de Usuarios</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona el acceso de los usuarios maestro y de las tiendas.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={loading || exporting || filteredUsers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              {exporting ? (
                <IconRefresh className="w-5 h-5 animate-spin" />
              ) : (
                <IconDownload className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={() => {
                const targetStoreId = assignStoreId || (stores.length > 0 ? stores[0].id : "");
                if (targetStoreId) {
                  setAssignStoreId(targetStoreId);
                  loadSets(targetStoreId);
                }
                setShowSetManager(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <IconShield className="w-5 h-5 text-blue-600" />
              <span className="hidden sm:inline">Grupos de Permisos</span>
              <span className="sm:hidden">Grupos</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md"
            >
              <IconPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSearch className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow placeholder-slate-400"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              value={filterStoreId}
              onChange={(e) => setFilterStoreId(e.target.value)}
            >
              <option value="">Todas las Tiendas</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => loadAll()}
            disabled={loading}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
            title="Refrescar datos"
          >
            <IconRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Tienda Asignada</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${!u.isActive ? 'opacity-70 grayscale' : ''}`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${u.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {(u.fullName || u.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          {u.fullName || "Sin nombre"}
                          {u.isSuperAdmin && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded text-[10px] font-black uppercase">SA</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.store ? (
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{u.store.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{u.store.slug}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No asignado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${u.isActive
                      ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-500/20"
                      : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400"
                      }`}>
                      {u.isActive ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setAssignUserId(u.id);
                        if (u.store) {
                          setAssignStoreId(u.store.id);
                          loadSets(u.store.id);
                          setShowAssignModal(true);
                        } else {
                          toast.error("Este usuario no tiene tienda asignada. Asígnale una tienda primero.");
                        }
                      }}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Asignar Permisos"
                    >
                      <IconShield className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setAssignUserId(u.id);
                        if (u.store) setAssignStoreId(u.store.id);
                        setShowStoreModal(true);
                      }}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Asignar Tienda"
                    >
                      <IconStore className="w-5 h-5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Eliminar permanentemente?")) return;
                        try {
                          await apiFetch(`/sa/users/${u.id}`, { method: "DELETE" });
                          toast.success("Usuario eliminado");
                          loadAll();
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <IconUser className="w-12 h-12 text-slate-300 mb-2" />
                      <p>No se encontraron usuarios.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Drawer */}
      {selectedUserId && (
        <UserDetailDrawer
          id={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onEdit={(u) => {
            setSelectedUserId(null);
            openEdit(u);
          }}
          onAssign={(u) => {
            setSelectedUserId(null);
            setAssignUserId(u.id);
            if (u.store) setAssignStoreId(u.store.id);
            setShowStoreModal(true);
          }}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <IconPlus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Nuevo Usuario</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={(e) => { onCreateUser(e); setShowCreateModal(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={createForm.email}
                  onChange={(e) => changeCreate("email", e.target.value)}
                  placeholder="ejemplo@autolote.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={createForm.fullName ?? ""}
                  onChange={(e) => changeCreate("fullName", e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={createForm.password}
                  onChange={(e) => changeCreate("password", e.target.value)}
                  required
                />
                <p className="mt-1 text-[10px] text-slate-400 italic">Default: Password123!</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={createForm.isSuperAdmin}
                    onChange={(e) => changeCreate("isSuperAdmin", e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Es SuperAdmin (Master)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) => changeCreate("isActive", e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuario Activo</span>
                </label>
              </div>
              <LoadingButton
                loading={savingUser}
                disabled={!canCreate}
                className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Crear Usuario
              </LoadingButton>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <IconEdit className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Editar Perfil</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={onUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nueva Contraseña (Opcional)</label>
                <input
                  type="password"
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={editForm.password}
                  onChange={(e) => setEditForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={editForm.isSuperAdmin}
                    onChange={(e) => setEditForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Es SuperAdmin (Master)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuario Activo</span>
                </label>
              </div>
              <LoadingButton
                loading={updating}
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20"
              >
                Guardar Cambios
              </LoadingButton>
            </form>
          </div>
        </div>
      )}

      {/* Assign Permissions Modal (only permission sets & matrix) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <IconShield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Asignar Permisos</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      {targetUser?.fullName || targetUser?.email || "Usuario"}
                    </span>
                    {targetStore && (
                      <>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-blue-600 uppercase font-bold">{targetStore.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowAssignModal(false); setAssignUserId(""); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={onAssign} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Info Card */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${targetUser?.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {(targetUser?.fullName || targetUser?.email || "?").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{targetUser?.fullName || "Sin nombre"}</div>
                  <div className="text-xs text-slate-400">{targetUser?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tienda</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{targetStore?.name || "—"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-500">Conjunto de Permisos (Rol)</label>
                </div>
                <select
                  className="block w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-2 text-sm"
                  value={assignPermissionSetId}
                  onChange={(e) => setAssignPermissionSetId(e.target.value)}
                >
                  <option value="">(Personalizado)</option>
                  {permissionSets.map(ps => <option key={ps.id} value={ps.id}>{ps.name}</option>)}
                </select>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isDirectOverride}
                    onChange={(e) => setIsDirectOverride(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sobrescribir manualmente</span>
                </label>
              </div>

              <div className={`space-y-3 transition-opacity ${!isDirectOverride ? "opacity-50 grayscale pointer-events-none" : ""}`}>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Matriz de Permisos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MODULES.map(mod => (
                    <div key={mod.key} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/30">
                      <div className="text-[10px] font-black uppercase text-slate-500 mb-2">{mod.label}</div>
                      <div className="flex flex-wrap gap-1">
                        {mod.actions.map(act => {
                          const isSelected = effectivePermissions[mod.key]?.includes(act);
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => togglePermission(mod.key, act)}
                              className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border text-slate-400'}`}
                            >
                              {act}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <LoadingButton
                loading={assigning}
                disabled={!canAssign}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Guardar Permisos
              </LoadingButton>
            </form>
          </div>
        </div>
      )}

      {/* Assign Store Modal (only store assignment) */}
      {showStoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <IconStore className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Asignar Tienda</h3>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    {targetUser?.fullName || targetUser?.email || "Usuario"}
                  </span>
                </div>
              </div>
              <button onClick={() => { setShowStoreModal(false); setAssignUserId(""); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={onAssignStore} className="p-6 space-y-6">
              {/* User Info Card */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${targetUser?.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {(targetUser?.fullName || targetUser?.email || "?").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{targetUser?.fullName || "Sin nombre"}</div>
                  <div className="text-xs text-slate-400">{targetUser?.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tienda a Asignar</label>
                <select
                  className="block w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-2.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={assignStoreId}
                  onChange={(e) => setAssignStoreId(e.target.value)}
                >
                  <option value="">Selecciona tienda...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <LoadingButton
                loading={assigning}
                disabled={!assignStoreId || !assignUserId}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20"
              >
                Asignar Tienda
              </LoadingButton>
            </form>
          </div>
        </div>
      )}

      {/* Permission Set Manager Modal */}
      {showSetManager && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">Conjuntos de Permisos</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Tienda seleccionada:</span>
                  <select
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                    value={assignStoreId}
                    onChange={(e) => {
                      const newStoreId = e.target.value;
                      setAssignStoreId(newStoreId);
                      loadSets(newStoreId);
                      setEditingSet(null);
                      setSetForm({ name: "", permissions: {} });
                    }}
                  >
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowSetManager(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* List of Sets */}
              <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 overflow-y-auto p-4">
                <button
                  onClick={() => {
                    setEditingSet(null);
                    setSetForm({ name: "", permissions: {} });
                  }}
                  className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Nuevo Conjunto
                </button>

                <div className="space-y-2">
                  {permissionSets.map(ps => (
                    <div
                      key={ps.id}
                      onClick={() => {
                        setEditingSet(ps);
                        setSetForm({ name: ps.name, permissions: ps.permissions || {} });
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${editingSet?.id === ps.id
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 dark:text-white uppercase">{ps.name}</span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("¿Eliminar este conjunto?")) return;
                            await apiFetch(`/sa/permission-sets/${ps.id}`, { method: "DELETE" });
                            loadSets(assignStoreId);
                            if (editingSet?.id === ps.id) setEditingSet(null);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-800">
                <form onSubmit={onSaveSet} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Conjunto</label>
                    <input
                      className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2 px-4 text-sm font-bold text-slate-900 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      value={setForm.name}
                      onChange={e => setSetForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ej: Administrador Contable"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Permisos del Conjunto</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MODULES.map(mod => (
                        <div key={mod.key} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{mod.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {mod.actions.map(action => {
                              const isSelected = setForm.permissions[mod.key]?.includes(action);
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => {
                                    setSetForm(prev => {
                                      const current = prev.permissions[mod.key] || [];
                                      const next = current.includes(action)
                                        ? current.filter((a: any) => a !== action)
                                        : [...current, action];
                                      const nextPerms = { ...prev.permissions };
                                      if (next.length === 0) delete nextPerms[mod.key];
                                      else nextPerms[mod.key] = next;
                                      return { ...prev, permissions: nextPerms };
                                    });
                                  }}
                                  className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all uppercase ${isSelected
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "bg-white text-slate-400 border border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700"
                                    }`}
                                >
                                  {action}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <LoadingButton
                      loading={savingSet}
                      className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/20"
                      type="submit"
                    >
                      {editingSet ? "Actualizar Conjunto" : "Crear Conjunto"}
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

function UserDetailDrawer({ id, onClose, onEdit, onAssign }: {
  id: string;
  onClose: () => void;
  onEdit: (u: User) => void;
  onAssign: (u: User) => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/sa/users/${id}`) as User;
        setUser(data);
      } catch (e: any) {
        toast.error(e.message || "Error cargando detalles del usuario");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!user && !loading) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${user?.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {(user?.fullName || user?.email || "??").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{user?.fullName || "Sin Nombre"}</h3>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{user?.isSuperAdmin ? "Super Admin" : "Usuario Estándar"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95">
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ) : (
            <>
              {/* Info Cards */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600">
                      <IconMail className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Correo Electrónico</label>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-orange-600">
                      <IconStore className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Tienda Principal</label>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
                        {user?.store?.name || "No Asignada"}
                      </p>
                      {user?.store?.slug && <p className="text-[10px] text-slate-400 font-mono tracking-widest">{user.store.slug}</p>}
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border flex items-center justify-between ${user?.isActive ? 'bg-green-50/50 border-green-100 text-green-700 dark:bg-green-500/5 dark:border-green-500/20' : 'bg-red-50/50 border-red-100 text-red-700 dark:bg-red-500/5 dark:border-red-500/20'}`}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estado de Cuenta</p>
                    <p className="text-sm font-bold uppercase tracking-tight">{user?.isActive ? "Activa y Funcional" : "Suspendida"}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${user?.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.6)]'}`}></div>
                </div>
              </div>

              {/* Membership Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Accesos y Permisos</h4>
                <div className="p-1 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Modo Maestro (SA)</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user?.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {user?.isSuperAdmin ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={() => user && onEdit(user)}
            className="flex-1 overflow-hidden group relative flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
          >
            <IconEdit className="w-5 h-5 text-indigo-600" />
            Editar Perfil
          </button>
          <button
            onClick={() => user && onAssign(user)}
            className="flex-1 overflow-hidden group relative flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <IconStore className="w-5 h-5" />
            Asignar Tienda
          </button>
        </div>
      </div>
    </div>
  );
}
