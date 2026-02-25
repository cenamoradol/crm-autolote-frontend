"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { SidebarNavigation } from "./SidebarNavigation";
import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        title={storeName}
        onMenuClick={() => setIsSidebarOpen(true)}
        right={null}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>

      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        session={session}
      />
    </div>
  );
}
