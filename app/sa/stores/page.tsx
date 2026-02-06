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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Create Store Form */}
      <div className="lg:col-span-5">
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="p-6">
            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Crear Store</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Crea el autolote y su dominio primario. Luego puedes agregar más dominios desde el detalle.
            </p>

            {err && <InlineAlert message={err} onClose={() => setErr(null)} />}

            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    value={form.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChange("name", v);
                      if (!form.slug) onChange("slug", toSlug(v));
                    }}
                    placeholder="TecambioTuCarro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                  Slug
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    value={form.slug}
                    onChange={(e) => onChange("slug", e.target.value)}
                    placeholder="tecambiotucarro"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Se usa para URLs públicas y referencias internas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                  Dominio primario
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    value={form.primaryDomain}
                    onChange={(e) => onChange("primaryDomain", e.target.value)}
                    placeholder="portal.tecambiotucarro.com"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Debe existir en DNS cuando lo vayas a usar en producción (CNAME/A).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                  Sucursal principal
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    value={form.primaryBranchName}
                    onChange={(e) => onChange("primaryBranchName", e.target.value)}
                    placeholder="Principal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                  Dirección (opcional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    value={form.primaryBranchAddress ?? ""}
                    onChange={(e) => onChange("primaryBranchAddress", e.target.value)}
                    placeholder="Tegucigalpa, Honduras"
                  />
                </div>
              </div>

              <div className="relative flex items-start py-2">
                <div className="flex h-6 items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => onChange("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isActive" className="font-medium text-slate-900 dark:text-slate-200">
                    Store activa
                  </label>
                </div>
              </div>

              <LoadingButton
                loading={saving}
                className={`flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${!canSave ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                type="submit"
              >
                Crear Store
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div className="ml-4 mt-2">
                <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Stores</h3>
              </div>
              <div className="ml-4 mt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:hover:bg-slate-600 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    "Refrescar"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 dark:text-white">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Slug
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Estado
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acción</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 dark:text-white">
                      {s.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {s.slug}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${s.isActive
                            ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                            : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                          }`}
                      >
                        {s.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/sa/stores/${s.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                      >
                        Ver detalle<span className="sr-only">, {s.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      No hay stores registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 dark:bg-slate-900/50 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              Consejo: desde el detalle puedes entrar en modo soporte (setea la store para /dashboard e /inventory).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
