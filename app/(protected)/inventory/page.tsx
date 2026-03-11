"use client";

import { VehicleListView } from "@/components/inventory/VehicleListView";

export default function InventoryPage() {
  return (
    <VehicleListView
      title="Inventario de Vehículos"
      subtitle="Gestiona el catálogo de unidades de tu lote."
      breadcrumbLabel="Inventario"
      filterMode="all"
      showCreateButton={true}
      showFilters={true}
    />
  );
}
