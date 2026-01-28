import MasterShell from "@/components/shell/MasterShell";
import TenantShell from "@/components/shell/TenantShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SA_STORE } from "@/lib/cookies";
import { getServerContext } from "@/lib/server/getServerContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getServerContext();

  if (ctx.mode === "unknown") {
    redirect("/domain-not-found");
  }

  const ck = await cookies();
  const saStoreId = ck.get(COOKIE_SA_STORE)?.value ?? null;

  return ctx.mode === "master" ? (
    <MasterShell supportStoreId={saStoreId}>{children}</MasterShell>
  ) : (
    <TenantShell storeName={ctx.store?.name || "AutoLote"}>{children}</TenantShell>
  );
}
