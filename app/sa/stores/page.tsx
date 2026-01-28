"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type Store = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type CreateStoreBody = {
  name: string;
  slug: string;
  primaryDomain: string;
  primaryBranchName: string;
  primaryBranchAddress?: string;
  isActive: boolean;
};

export default function SaStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<CreateStoreBody>({
    name: "",
    slug: "",
    primaryDomain: "",
    primaryBranchName: "Principal",
    primaryBranchAddress: "",
    isActive: true
  });

  const canSave = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.slug.trim().length >= 2 &&
      form.primaryDomain.trim().length >= 3 &&
      form.primaryBranchName.trim().length >= 2
    );
  }, [form]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch<Store[]>("/sa/stores");
      setStores(data);
    } catch (e: any) {
      setErr(e.message || "Error cargando stores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange<K extends keyof CreateStoreBody>(key: K, value: CreateStoreBody[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setErr(null);
    try {
      await apiFetch("/sa/stores", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setForm({
        name: "",
        slug: "",
        primaryDomain: "",
        primaryBranchName: "Principal",
        primaryBranchAddress: "",
        isActive: true
      });

      await load();
    } catch (e: any) {
      setErr(e.message || "Error creando store");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-2">Crear Store</h5>
            <p className="text-muted mb-3">
              Crea el autolote y su dominio primario. Luego puedes agregar más dominios desde el detalle.
            </p>

            {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

            <form onSubmit={onCreate}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange("name", v);
                    if (!form.slug) onChange("slug", toSlug(v));
                  }}
                  placeholder="TecambioTuCarro"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Slug</label>
                <input
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => onChange("slug", e.target.value)}
                  placeholder="tecambiotucarro"
                />
                <div className="form-text">Se usa para URLs públicas y referencias internas.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Dominio primario</label>
                <input
                  className="form-control"
                  value={form.primaryDomain}
                  onChange={(e) => onChange("primaryDomain", e.target.value)}
                  placeholder="portal.tecambiotucarro.com"
                />
                <div className="form-text">
                  Debe existir en DNS cuando lo vayas a usar en producción (CNAME/A).
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Sucursal principal</label>
                <input
                  className="form-control"
                  value={form.primaryBranchName}
                  onChange={(e) => onChange("primaryBranchName", e.target.value)}
                  placeholder="Principal"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección (opcional)</label>
                <input
                  className="form-control"
                  value={form.primaryBranchAddress ?? ""}
                  onChange={(e) => onChange("primaryBranchAddress", e.target.value)}
                  placeholder="Tegucigalpa, Honduras"
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => onChange("isActive", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isActive">
                  Store activa
                </label>
              </div>

              <LoadingButton
                loading={saving}
                className={`btn btn-primary w-100 ${!canSave ? "disabled" : ""}`}
                type="submit"
              >
                Crear Store
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Stores</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Slug</th>
                    <th>Estado</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.name}</td>
                      <td className="text-muted">{s.slug}</td>
                      <td>
                        <span className={`badge ${s.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                          {s.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link className="btn btn-outline-primary btn-sm" href={`/sa/stores/${s.id}`}>
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Sin stores
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <small className="text-muted">
              Tip: desde el detalle puedes entrar en modo soporte (setea la store para /dashboard e /inventory).
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
