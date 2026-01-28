"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Lead } from "@/lib/leads";

function fmt(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function LeadTable({ items }: { items: Lead[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const returnTo = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
  const encoded = encodeURIComponent(returnTo);

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Status</th>
            <th>Asignado</th>
            <th>Customer</th>
            <th>Creado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id}>
              <td className="fw-semibold">{l.fullName ?? "(Sin nombre)"}</td>
              <td className="text-muted">
                <div>{l.phone ?? "-"}</div>
                <small>{l.email ?? ""}</small>
              </td>
              <td>
                <span className="badge text-bg-primary">{l.status}</span>
              </td>
              <td className="text-muted">{l.assignedTo?.fullName ?? l.assignedTo?.email ?? "-"}</td>
              <td className="text-muted">{l.customer?.fullName ?? "-"}</td>
              <td className="text-muted">{fmt(l.createdAt)}</td>
              <td className="text-end">
                <Link className="btn btn-outline-primary btn-sm" href={`/leads/${l.id}?returnTo=${encoded}`}>
                  Ver / Editar
                </Link>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="text-muted">
                Sin leads
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
