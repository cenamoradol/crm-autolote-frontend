"use client";

import Link from "next/link";
import type { Customer } from "@/lib/customers";

export default function CustomerTable({ items }: { items: Customer[] }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Documento</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td className="fw-semibold">{c.fullName}</td>
              <td className="text-muted">{c.phone ?? "-"}</td>
              <td className="text-muted">{c.email ?? "-"}</td>
              <td className="text-muted">{c.documentId ?? "-"}</td>
              <td className="text-end">
                <Link className="btn btn-outline-primary btn-sm" href={`/customers/${c.id}`}>
                  Ver / Editar
                </Link>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted">
                Sin customers
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
