import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";

export default function MasterShell({
  children,
  supportStoreId
}: {
  children: React.ReactNode;
  supportStoreId?: string | null;
}) {
  return (
    <div className="min-vh-100">
      <Navbar
        title="SuperAdmin"
        right={
          <>
            <Link className="btn btn-outline-primary btn-sm" href="/sa">
              SA
            </Link>
            <Link className="btn btn-outline-secondary btn-sm" href="/sa/stores">
              Stores
            </Link>
            <Link className="btn btn-outline-secondary btn-sm" href="/sa/users">
              Users
            </Link>

            <Link className="btn btn-outline-secondary btn-sm" href="/support/select-store">
              {supportStoreId ? "Cambiar Store" : "Elegir Store"}
            </Link>
            <a className="nav-link" href="/leads">Leads</a>

            <form action="/api/auth/logout" method="post">
              <button className="btn btn-outline-secondary btn-sm">Salir</button>
            </form>
          </>
        }
      />

      <div className="container py-3">{children}</div>
    </div>
  );
}
