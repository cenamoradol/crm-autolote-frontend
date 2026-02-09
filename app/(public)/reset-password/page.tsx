"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
                <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                    <h1 className="text-2xl font-bold mb-2">Token inválido</h1>
                    <p className="text-slate-500 mb-6">El enlace de recuperación no es válido o ha expirado.</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al restablecer la contraseña");

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
                <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-800">
                    <div className="size-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">¡Contraseña restablecida!</h1>
                    <p className="text-slate-500 mb-6">Tu contraseña ha sido actualizada correctamente. Serás redirigido al login en unos segundos.</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Ir al Login ahora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-subtle font-sans">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="pt-10 pb-4 text-center px-8">
                        <div className="flex justify-center mb-6">
                            <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">lock_reset</span>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">Restablecer contraseña</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Ingresa tu nueva contraseña para acceder a tu cuenta
                        </p>
                    </div>

                    <div className="px-8 pb-10">
                        {error && (
                            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_check</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                            >
                                {loading ? "Actualizando..." : "Restablecer contraseña"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
