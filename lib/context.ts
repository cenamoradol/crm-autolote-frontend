export type TenantMode = "master" | "tenant" | "unknown";

export type TenantContext = {
  mode: TenantMode;
  host: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};
