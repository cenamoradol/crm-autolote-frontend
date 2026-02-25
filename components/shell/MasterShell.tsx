"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { SidebarNavigation } from "./SidebarNavigation";
import { useState } from "react";
import { SessionUser } from "@/lib/server/getServerSession";

export default function MasterShell({
  children,
  supportStoreId,
  session,
}: {
  children: React.ReactNode;
  supportStoreId?: string | null;
  session: SessionUser;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        title="SuperAdmin"
        onMenuClick={() => setIsSidebarOpen(true)}
        right={
          <div className="flex items-center gap-2">
            <Link
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md transition-colors whitespace-nowrap"
              href="/support/select-store"
            >
              {supportStoreId ? "Cambiar Store" : "Elegir Store"}
            </Link>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>

      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        session={session}
        supportStoreId={supportStoreId}
      />
    </div>
  );
}
