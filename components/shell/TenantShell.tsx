import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";

export default function TenantShell({ storeName, children }: { storeName: string; children: React.ReactNode }) {
  return (
    <div className="min-vh-100">
      <Navbar
        title={storeName}
        right={
          <form action="/api/auth/logout" method="post">
            <button className="btn btn-outline-secondary btn-sm">Salir</button>
          </form>
        }
      />
      <div className="container py-3">
        <div className="d-flex gap-2 mb-3">
          {/* <Link className="btn btn-light" href="/dashboard">
            Dashboard
          </Link> */}
          <Link className="btn btn-light" href="/inventory">
            Inventarios
          </Link>
          <Link className="btn btn-light" href="/sales">
            Ventas
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
