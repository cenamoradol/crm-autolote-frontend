"use client";

import { VehicleListView } from "@/components/inventory/VehicleListView";

export default function RematesPage() {
    return (
        <VehicleListView
            title="Vehículos en Remate"
            subtitle="Unidades con precio especial disponibles para venta inmediata."
            breadcrumbLabel="En Remate"
            filterMode="clearance"
            showCreateButton={true}
            showFilters={true}
        />
    );
}
