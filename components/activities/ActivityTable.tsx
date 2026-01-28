"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Activity } from "@/lib/activities";

function fmt(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function ActivityTable({ items }: { items: Activity[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const returnTo = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
  const encoded = encodeURIComponent(returnTo);

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Notas</th>
            <th>Contexto</th>
            <th>Creado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="badge text-bg-primary">{a.type}</span>
              </td>
              <td className="text-muted">{a.notes ?? "-"}</td>
              <td className="text-muted">
                {a.leadId && <span className="badge text-bg-secondary me-1">Lead</span>}
                {a.customerId && <span className="badge text-bg-secondary me-1">Customer</span>}
                {a.vehicleId && <span className="badge text-bg-secondary">Vehicle</span>}
                {!a.leadId && !a.customerId && !a.vehicleId && <span>-</span>}
              </td>
              <td className="text-muted">{fmt(a.createdAt)}</td>
              <td className="text-end">
                <Link className="btn btn-outline-primary btn-sm" href={`/activities/${a.id}?returnTo=${encoded}`}>
                  Editar
                </Link>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted">
                Sin actividades
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
