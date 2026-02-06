import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";

export default function MasterShell({
  children,
  supportStoreId,
}: {
  children: React.ReactNode;
  supportStoreId?: string | null;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        title="SuperAdmin"
        center={
          <div className="flex gap-1 h-full items-center">
            <Link
              href="/sa"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/sa/stores"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
            >
              Stores
            </Link>
            <Link
              href="/sa/users"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
            >
              Users
            </Link>
            <Link
              href="/sa/vehicle-types"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
            >
              Tipos de Vehículo
            </Link>


            {supportStoreId && (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                <Link
                  href="/inventory"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  Inventarios
                </Link>
                <Link
                  href="/sales"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  Ventas
                </Link>
                <Link
                  href="/activities"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  Actividades
                </Link>
                <Link
                  href="/customers"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  Clientes
                </Link>
                <Link
                  href="/leads"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  Leads
                </Link>
              </>
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Link
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors whitespace-nowrap"
              href="/support/select-store"
            >
              {supportStoreId ? "Cambiar Store" : "Elegir Store"}
            </Link>

            <form action="/api/auth/logout" method="post">
              <button className="text-slate-500 hover:text-red-600 font-medium text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Salir</span>
              </button>
            </form>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
    </div>
  );
}
