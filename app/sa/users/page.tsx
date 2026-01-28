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
  { key: "admin", label: "admin" },
  { key: "supervisor", label: "supervisor" },
  { key: "seller", label: "seller" }
];

export default function SaUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [assigning, setAssigning] = useState(false);

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
  const [assignRoles, setAssignRoles] = useState<string[]>(["seller"]);

  const canCreate = useMemo(() => {
    return createForm.email.includes("@") && createForm.password.length >= 6;
  }, [createForm]);

  const canAssign = useMemo(() => {
    return !!assignStoreId && !!assignUserId && assignRoles.length > 0;
  }, [assignStoreId, assignUserId, assignRoles]);

  function changeCreate<K extends keyof CreateUserBody>(key: K, value: CreateUserBody[K]) {
    setCreateForm((p) => ({ ...p, [key]: value }));
  }

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [u, s] = await Promise.all([
        apiFetch<User[]>("/sa/users"),
        apiFetch<Store[]>("/sa/stores")
      ]);

      setUsers(u);
      setStores(s);

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
  }, []);

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

  return (
    <div className="row g-3">
      <div className="col-12">
        {(err || ok) && (
          <InlineAlert
            type={err ? "danger" : "success"}
            message={err ?? ok ?? ""}
            onClose={() => {
              setErr(null);
              setOk(null);
            }}
          />
        )}
      </div>

      <div className="col-12 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-2">Crear Usuario</h5>
            <p className="text-muted mb-3">Crea usuarios para luego asignarlos a Stores con roles.</p>

            <form onSubmit={onCreateUser}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={createForm.email}
                  onChange={(e) => changeCreate("email", e.target.value)}
                  placeholder="nuevo@cliente.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={createForm.password}
                  onChange={(e) => changeCreate("password", e.target.value)}
                />
                <div className="form-text">En producción haremos reset password / invitación.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre (opcional)</label>
                <input
                  className="form-control"
                  value={createForm.fullName ?? ""}
                  onChange={(e) => changeCreate("fullName", e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isActiveUser"
                  checked={createForm.isActive}
                  onChange={(e) => changeCreate("isActive", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isActiveUser">
                  Usuario activo
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isSuperAdmin"
                  checked={createForm.isSuperAdmin}
                  onChange={(e) => changeCreate("isSuperAdmin", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isSuperAdmin">
                  Es SuperAdmin (master)
                </label>
              </div>

              <LoadingButton
                loading={savingUser}
                className={`btn btn-primary w-100 ${!canCreate ? "disabled" : ""}`}
                type="submit"
              >
                Crear usuario
              </LoadingButton>
            </form>
          </div>
        </div>

        <div className="card shadow-sm mt-3">
          <div className="card-body">
            <h6 className="mb-2">Assign to Store</h6>
            <p className="text-muted mb-3">
              Asigna un usuario a una store y define roles (admin/supervisor/seller).
            </p>

            <form onSubmit={onAssign}>
              <div className="mb-3">
                <label className="form-label">Store</label>
                <select className="form-select" value={assignStoreId} onChange={(e) => setAssignStoreId(e.target.value)}>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <select className="form-select" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} {u.isSuperAdmin ? "(SA)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Roles</label>
                <div className="d-flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <label key={r.key} className="btn btn-outline-secondary btn-sm">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={assignRoles.includes(r.key)}
                        onChange={() => toggleRole(r.key)}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <div className="form-text">Mínimo 1 rol.</div>
              </div>

              <LoadingButton
                loading={assigning}
                className={`btn btn-outline-primary w-100 ${!canAssign ? "disabled" : ""}`}
                type="submit"
              >
                Asignar roles
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Usuarios</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={loadAll} disabled={loading}>
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>SA</th>
                    <th>Activo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.email}</td>
                      <td>{u.fullName ?? "-"}</td>
                      <td>{u.isSuperAdmin ? "Sí" : "No"}</td>
                      <td>{u.isActive ? "Sí" : "No"}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Sin usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <small className="text-muted">
              Luego añadimos: editar usuario, activar/desactivar, reset password, etc.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
