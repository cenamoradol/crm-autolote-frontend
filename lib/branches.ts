import { apiFetch } from "@/lib/api";

export type Branch = {
  id: string;
  name: string;
  address?: string | null;
  isPrimary?: boolean;
};

export async function listBranches(): Promise<Branch[]> {
  return apiFetch<Branch[]>(`/branches`);
}
