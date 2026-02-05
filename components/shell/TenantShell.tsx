import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";

export default function TenantShell({ storeName, children }: { storeName: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        title={storeName}
        center={
          <div className="flex gap-4 h-full items-center">
            {/* Dashboard link disabled in original, keeping it that way or enabling if needed. 
                Original had it commented out. */}
            <Link
              href="/inventory"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Inventario
            </Link>
            <Link
              href="/sales"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Ventas
            </Link>
            <Link
              href="/activities"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Actividades
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clientes
            </Link>
            <Link
              href="/leads"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Leads
            </Link>
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
