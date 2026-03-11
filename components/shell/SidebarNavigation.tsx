"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/server/getServerSession";

interface SidebarNavigationProps {
    isOpen: boolean;
    onClose: () => void;
    session: SessionUser;
    supportStoreId?: string | null;
}

export function SidebarNavigation({ isOpen, onClose, session, supportStoreId }: SidebarNavigationProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isSA = session.isSuperAdmin;
    const permissions = session.permissions || [];

    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    // Definir permisos usando RBAC Granular Remoto (o fallback local)
    const canSeeSales = permissions.includes("sales:read") || isSA;
    const canSeeActivities = permissions.includes("activities:read") || isSA;
    const canSeeConsignors = permissions.includes("consignors:read") || isSA;
    const canSeeCustomers = permissions.includes("customers:read") || isSA;
    const canSeeLeads = permissions.includes("leads:read") || isSA;
    const canSeeDashboard = permissions.includes("dashboard:read") || isSA;
    const canSeeReports = permissions.includes("reports:read") || isSA;
    const canSeeSettings = permissions.includes("store_settings:read") || permissions.includes("store_settings:update") || isSA;

    // Close when pressing Esc
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                isOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        const timeoutId = setTimeout(() => {
            window.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Prevent scrolling on body when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const adminLinks = [
        { href: "/sa", label: "Inicio", icon: "home" },
        { href: "/sa/stores", label: "Stores", icon: "store" },
        { href: "/sa/users", label: "Users", icon: "group" },
        { href: "/sa/plans", label: "Planes de Suscripción", icon: "card_membership" },
        { href: "/sa/vehicle-types", label: "Tipos de Vehículo", icon: "directions_car" },
        { href: "/sa/brands", label: "Marcas y Modelos", icon: "branding_watermark" },
    ];

    return (
        <>
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden="true"
            />

            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 w-72 h-full bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-slate-200 dark:border-slate-800`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined text-[20px]">directions_car</span>
                        </div>
                        CRM AutoLote
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                        Principal
                    </div>

                    {canSeeDashboard && (
                        <Link
                            href="/dashboard"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/dashboard")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            Dashboard
                        </Link>
                    )}

                    <Link
                        href="/inventory"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/inventory")
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        Inventario
                    </Link>

                    <Link
                        href="/remates"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/remates")
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">local_offer</span>
                        En Remate
                    </Link>

                    {canSeeSales && (
                        <Link
                            href="/sales"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/sales")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                            Ventas
                        </Link>
                    )}

                    {canSeeActivities && (
                        <Link
                            href="/activities"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/activities")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">event_note</span>
                            Actividades
                        </Link>
                    )}

                    {canSeeCustomers && (
                        <Link
                            href="/customers"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/customers")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">groups</span>
                            Clientes
                        </Link>
                    )}

                    {canSeeLeads && (
                        <Link
                            href="/leads"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/leads")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                            Leads
                        </Link>
                    )}

                    {canSeeConsignors && (
                        <Link
                            href="/consignors"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/consignors")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">real_estate_agent</span>
                            Consignatarios
                        </Link>
                    )}

                    {canSeeReports && (
                        <Link
                            href="/reports/team"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/reports/team")
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                            Rendimiento
                        </Link>
                    )}

                    {canSeeSettings && (
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                                Configuración
                            </div>
                            <Link
                                href="/settings/profile"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/settings/profile")
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Mi Perfil
                            </Link>
                        </div>
                    )}

                    {/* Dropdown de opciones administrativas */}
                    {isSA && (
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[20px] text-purple-600 dark:text-purple-400">admin_panel_settings</span>
                                    Panel de Administración
                                </div>
                                <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isAdminPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    expand_more
                                </span>
                            </button>

                            <div className={`mt-1 overflow-hidden transition-all duration-300 pl-9 ${isAdminPanelOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="flex flex-col space-y-1 py-1">
                                    {adminLinks.map((link) => {
                                        const isActive = pathname === link.href || (link.href !== "/sa" && pathname.startsWith(link.href));
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
                    <form action="/api/auth/logout" method="post">
                        <button className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
