import MasterShell from "@/components/shell/MasterShell";
import TenantShell from "@/components/shell/TenantShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SA_STORE } from "@/lib/cookies";
import { getServerContext } from "@/lib/server/getServerContext";
import { getServerSession } from "@/lib/server/getServerSession";
import { UserProvider } from "@/components/providers/UserProvider";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getServerContext();
  const session = await getServerSession();

  if (ctx.mode === "unknown") {
    redirect("/domain-not-found");
  }

  if (!session) {
    redirect("/login");
  }

  const ck = await cookies();
  const saStoreId = ck.get(COOKIE_SA_STORE)?.value ?? null;

  return ctx.mode === "master" ? (
    <MasterShell supportStoreId={saStoreId} session={session}>
      <UserProvider user={session}>{children}</UserProvider>
    </MasterShell>
  ) : (
    <TenantShell storeName={ctx.store?.name || "AutoLote"} session={session}>
      <UserProvider user={session}>{children}</UserProvider>
    </TenantShell>
  );
}
