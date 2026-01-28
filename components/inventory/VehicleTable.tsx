"use client";

import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function VehicleTable({
  vehicles,
  onTogglePublish,
  onArchive,
  togglingId,
  archivingId
}: {
  vehicles: Vehicle[];
  onTogglePublish: (id: string, next: boolean) => void;
  onArchive: (id: string) => void;
  togglingId?: string | null;
  archivingId?: string | null;
}) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Título</th>
            <th>Catálogo</th>
            <th>Publicado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td className="fw-semibold">{v.title ?? "(sin título)"}</td>

              <td className="text-muted">
                <div>{v.branch?.name ?? "Branch"}</div>
                <small>
                  {(v.brand?.name ?? "Marca")} / {(v.model?.name ?? "Modelo")}
                </small>
              </td>

              <td>
                <LoadingButton
                  loading={togglingId === v.id}
                  className={`btn btn-sm ${v.isPublished ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => onTogglePublish(v.id, !v.isPublished)}
                  type="button"
                >
                  {v.isPublished ? "Sí" : "No"}
                </LoadingButton>
              </td>

              <td className="text-end d-flex justify-content-end gap-2">
                <Link className="btn btn-outline-primary btn-sm" href={`/inventory/${v.id}`}>
                  Editar
                </Link>

                <LoadingButton
                  loading={archivingId === v.id}
                  className="btn btn-outline-danger btn-sm"
                  type="button"
                  onClick={() => {
                    const ok = confirm("¿Archivar este vehículo? (quedará ARCHIVED y se despublicará)");
                    if (ok) onArchive(v.id);
                  }}
                >
                  Archivar
                </LoadingButton>
              </td>
            </tr>
          ))}

          {vehicles.length === 0 && (
            <tr>
              <td colSpan={4} className="text-muted">
                Sin vehículos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
