"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    // Common Header component for consistent look
    const Header = () => (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-4">
            <div className="flex items-center gap-3 text-[#0d131b] dark:text-white">
                <div className="size-8 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600">
                        <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                    </svg>
                </div>
                <h2 className="text-[#0d131b] dark:text-white text-lg font-bold leading-tight">AutoLote CRM</h2>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-colors">
                <span className="truncate">Contactar Soporte</span>
            </button>
        </header>
    );

    const Footer = () => (
        <footer className="py-6 text-center text-slate-400 text-xs">
            <p>© 2026 AutoLote CRM. Todos los derechos reservados.</p>
        </footer>
    );

    if (!token && !success) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-subtle">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-800">
                        <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Token inválido</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">El enlace de recuperación no es válido o ha expirado.</p>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-subtle">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                        <div className="size-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">¡Contraseña restablecida!</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Tu contraseña ha sido actualizada correctamente. Serás redirigido al login en unos segundos.</p>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            Ir al Login ahora
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-subtle font-sans">
            <Header />
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
                                    <p className="text-red-600 text-sm font-medium">{error}</p>
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
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
                                type="submit"
                            >
                                {loading ? "Actualizando..." : "Restablecer contraseña"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Cargando...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
