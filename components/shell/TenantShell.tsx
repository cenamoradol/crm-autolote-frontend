import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { SessionUser } from "@/lib/server/getServerSession";

export default function TenantShell({
  storeName,
  children,
  session
}: {
  storeName: string;
  children: React.ReactNode;
  session: SessionUser;
}) {
  const isSA = session.isSuperAdmin;
  const roles = session.roles;
  const isAdmin = roles.includes("admin");
  const isSupervisor = roles.includes("supervisor");
  const isSeller = roles.includes("seller");

  // Definir permisos
  const canSeeSales = isSA || isAdmin || isSupervisor;
  const canSeeActivities = isSA || isAdmin || isSupervisor || isSeller;
  const canSeeCustomers = isSA || isAdmin || isSupervisor || isSeller;
  const canSeeLeads = isSA || isAdmin || isSupervisor;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        title={storeName}
        center={
          <div className="flex gap-4 h-full items-center">
            <Link
              href="/inventory"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Inventario
            </Link>

            {canSeeSales && (
              <Link
                href="/sales"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Ventas
              </Link>
            )}

            {canSeeActivities && (
              <Link
                href="/activities"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Actividades
              </Link>
            )}

            {canSeeCustomers && (
              <Link
                href="/customers"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clientes
              </Link>
            )}

            {canSeeLeads && (
              <Link
                href="/leads"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Leads
              </Link>
            )}
          </div>
        }
        right={
          <form action="/api/auth/logout" method="post">
            <button className="text-slate-500 hover:text-red-600 font-medium text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Salir</span>
            </button>
          </form>
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
