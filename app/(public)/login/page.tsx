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

  const title =
    ctx?.mode === "tenant"
      ? `Portal ${ctx.store?.name ?? ""}`
      : ctx?.mode === "master"
      ? "Panel SuperAdmin"
      : "Portal";

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-3">{title}</h4>

            {ctx?.mode === "unknown" && (
              <div className="alert alert-warning">
                Dominio no reconocido. Verifica que exista en StoreDomain o entra por el dominio master.
              </div>
            )}

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button disabled={loading} className="btn btn-primary w-100">
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <hr />
            <small className="text-muted">
              * En dominio master solo entra SuperAdmin. En dominio tenant, solo usuarios asignados a esa store.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
