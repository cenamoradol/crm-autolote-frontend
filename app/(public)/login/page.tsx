"use client";

import { useEffect, useState } from "react";

type Context = { mode: "master" | "tenant" | "unknown"; store?: { name: string } };

export default function LoginPage() {
  const [ctx, setCtx] = useState<Context | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/context", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCtx)
      .catch(() => setCtx({ mode: "unknown" }));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || data?.error || "Login failed");

      const mode = data?.context?.mode as string | undefined;
      if (mode === "master") window.location.href = "/sa";
      else window.location.href = "/inventory";
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-4">
        <div className="flex items-center gap-3 text-[#0d131b] dark:text-white">
          <div className="size-8 text-primary">
            {/* Logo placeholder - using a generic blue icon shape */}
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600">
              <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-[#0d131b] dark:text-white text-lg font-bold leading-tight">AutoLote CRM</h2>
        </div>
        <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-colors">
          <span className="truncate">Contactar Soporte</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">

          <div className="pt-10 pb-4 text-center px-8">
            <div className="flex justify-center mb-6">
              <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-3xl">directions_car</span>
              </div>
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">Iniciar sesión</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Accede al panel de control de tu concesionario
            </p>
          </div>

          <div className="px-8 pb-10">
            {/* Context/Domain Warning */}
            {ctx?.mode === "unknown" && (
              <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">warning</span>
                  <span>Dominio no reconocido. Verifica que exista en StoreDomain o entra por el dominio master.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                  <div className="flex flex-col">
                    <p className="text-red-700 text-sm font-bold leading-tight">Error de acceso</p>
                    <p className="text-red-600 text-xs font-normal mt-0.5">{err}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">alternate_email</span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                    id="email"
                    name="email"
                    placeholder="ejemplo@concesionario.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                  />
                  <label className="ml-2 block text-xs text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="remember-me">
                    Recordarme
                  </label>
                </div>
                <div className="text-xs">
                  <a className="font-medium text-blue-600 hover:text-blue-500" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
              >
                {loading ? "Ingresando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-4">
                Otras opciones
              </p>
              <div className="flex flex-col gap-3">
                <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group" href="#">
                  <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">help</span>
                  Solicitar acceso
                </a>
                <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group" href="#">
                  <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">headset_mic</span>
                  Soporte Técnico
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs">
        <p>© 2024 AutoLote CRM. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="hover:text-slate-600">Privacidad</a>
          <a href="#" className="hover:text-slate-600">Términos</a>
        </div>
      </footer>
    </div>
  );
}

