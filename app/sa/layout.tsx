import MasterShell from "@/components/shell/MasterShell";
import { cookies } from "next/headers";
import { COOKIE_SA_STORE } from "@/lib/cookies";
import { getServerContext } from "@/lib/server/getServerContext";
import { redirect } from "next/navigation";

export default async function SaLayout({ children }: { children: React.ReactNode }) {
    const ctx = await getServerContext();

    if (ctx.mode === "unknown") {
        redirect("/domain-not-found");
    }

    // Si no es master, significa que está intentando entrar al panel SA desde un subdominio/dominio de cliente
    if (ctx.mode !== "master") {
        redirect("/dashboard");
    }

    const ck = await cookies();
    const saStoreId = ck.get(COOKIE_SA_STORE)?.value ?? null;

    return <MasterShell supportStoreId={saStoreId}>{children}</MasterShell>;
}
