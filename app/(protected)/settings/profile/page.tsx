"use client";

import { useState } from "react";
import { useUser } from "@/components/providers/UserProvider";
import toast from "react-hot-toast";

// --- Icons ---
function IconUser({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconLock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function IconShield({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    );
}

function IconSave({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-8H7v8" />
            <path d="M7 3v5h8" />
        </svg>
    );
}

export default function ProfilePage() {
    const user = useUser();

    // Personal info state
    const [fullName, setFullName] = useState(user.fullName || "");
    const [phone, setPhone] = useState((user as any).phone || "");
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!fullName.trim()) return toast.error("El nombre es requerido");
        setSavingProfile(true);
        try {
            const res = await fetch("/api/bff/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() || null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al guardar");
            toast.success("Perfil actualizado correctamente");
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar perfil");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!currentPassword) return toast.error("Ingresa tu contraseña actual");
        if (newPassword.length < 6) return toast.error("La nueva contraseña debe tener al menos 6 caracteres");
        if (newPassword !== confirmPassword) return toast.error("Las contraseñas no coinciden");

        setSavingPassword(true);
        try {
            const res = await fetch("/api/bff/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");
            toast.success("Contraseña actualizada correctamente");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.message || "Error al cambiar contraseña");
        } finally {
            setSavingPassword(false);
        }
    }

    const initials = (user.fullName || user.email || "?").substring(0, 2).toUpperCase();
    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("es-HN", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200">Configuración</span>
                    <span className="mx-2">›</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Mi Perfil</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Administra tu información personal y seguridad.</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/40 dark:shadow-indigo-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl font-black border border-white/20 shadow-inner shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black truncate">{user.fullName || user.email}</h2>
                        <p className="text-blue-100 text-sm font-medium truncate mt-0.5">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {user.isSuperAdmin && (
                                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/30">
                                    <IconShield className="w-3 h-3" />
                                    Super Admin
                                </span>
                            )}
                            <span className="text-blue-200 text-xs">
                                Miembro desde {memberSince}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <IconUser className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Información Personal</h3>
                            <p className="text-xs text-slate-400">Actualiza tu nombre y teléfono</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                disabled
                                value={user.email}
                                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">El correo no se puede cambiar</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+504 9999-9999"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                <IconSave className="w-4 h-4" />
                                {savingProfile ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                            <IconLock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Seguridad</h3>
                            <p className="text-xs text-slate-400">Cambiar contraseña de acceso</p>
                        </div>
                    </div>
                    <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Contraseña Actual
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Confirmar Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Repite la nueva contraseña"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                <IconLock className="w-4 h-4" />
                                {savingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400">
                        <IconShield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Información de Cuenta</h3>
                        <p className="text-xs text-slate-400">Detalles de tu cuenta y permisos</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Activo</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rol</p>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {user.isSuperAdmin ? "Super Administrador" : "Usuario"}
                            </span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Permisos</p>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {user.isSuperAdmin ? "Acceso total" : `${user.permissions?.length || 0} permisos`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
