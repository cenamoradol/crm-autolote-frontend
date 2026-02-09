import { cookies, headers } from "next/headers";
import { COOKIE_ACCESS, COOKIE_SA_STORE } from "@/lib/cookies";
import { normalizeHost } from "@/lib/host";

export type SessionUser = {
    id: string;
    email: string;
    fullName: string | null;
    isSuperAdmin: boolean;
    roles: string[];
};

export async function getServerSession(): Promise<SessionUser | null> {
    const backend = process.env.BACKEND_URL!;
    const ck = await cookies();
    const access = ck.get(COOKIE_ACCESS)?.value;
    if (!access) return null;

    const h = await headers();
    const host = normalizeHost(h.get("x-forwarded-host") || h.get("host") || "");
    const saStoreHeader = ck.get(COOKIE_SA_STORE)?.value;

    try {
        const outgoingHeaders: Record<string, string> = {
            "Authorization": `Bearer ${access}`,
            "x-forwarded-host": host,
        };
        if (saStoreHeader) {
            outgoingHeaders["x-store-id"] = saStoreHeader;
        }

        const res = await fetch(`${backend}/auth/me`, {
            headers: outgoingHeaders,
            cache: "no-store",
        });

        if (!res.ok) return null;

        return (await res.json()) as SessionUser;
    } catch (e) {
        console.error("Error fetching session:", e);
        return null;
    }
}
