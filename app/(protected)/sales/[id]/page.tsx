"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSaleFromList, money, type Sale } from "@/lib/sales";
import { getVehicle, type Vehicle } from "@/lib/vehicles";

// --- Icons ---
function IconPrinter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  );
}
function IconMail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
function IconFileText({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
function IconExternalLink({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  )
}
function IconPhone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/sales";

  const [sale, setSale] = useState<Sale | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await getSaleFromList(id);
        setSale(s || null);
        if (s?.vehicleId) {
          // Fetch full vehicle details to get images/vin/mileage which are absent in Sale['vehicle']
          getVehicle(s.vehicleId).then(setVehicleDetail).catch(() => null);
        }
      } catch {
        setSale(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalle...</div>;

  if (!sale) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Venta no encontrada</h2>
        <Link href={returnTo} className="text-blue-600 hover:underline">Volver al listado</Link>
      </div>
    )
  }

  // Derived Data
  const vehicleBasic = sale.vehicle;
  const vehicleFull = vehicleDetail;

  const vehicleTitle = vehicleFull?.title ??
    vehicleBasic?.title ??
    [vehicleBasic?.brand?.name, vehicleBasic?.model?.name, vehicleBasic?.year].filter(Boolean).join(" ") ??
    "Vehículo Desconocido";

  const sellerName = sale.soldBy?.fullName || sale.soldBy?.email || "Sin vendedor";
  const customerName = sale.customer?.fullName || sale.lead?.fullName || "Sin cliente";
  const customerEmail = sale.customer?.email || sale.lead?.email;
  const customerPhone = sale.customer?.phone || sale.lead?.phone;

  const formattedDate = new Date(sale.soldAt).toLocaleDateString();
  const formattedTime = new Date(sale.soldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Mocked Activities
  const activities = [
    { id: 1, type: "call", date: "12 Oct 2023", title: "Llamada", summary: "Confirmación de términos financieros y seguro." },
    { id: 2, type: "meeting", date: "10 Oct 2023", title: "Reunión", summary: "Prueba de manejo satisfactoria y evaluación de trade-in." },
    { id: 3, type: "lead", date: "08 Oct 2023", title: "Lead", summary: "Interés registrado a través de Facebook Marketplace." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/sales" className="hover:text-blue-600">Ventas</Link>
            <span className="mx-2">›</span>
            <span>Detalle de Venta</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Detalle de Venta: #{sale.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                COMPLETADO
              </span>
            </div>

            <div className="flex gap-3">
              <button className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <IconPrinter className="w-4 h-4 mr-2" />
                Imprimir Recibo
              </button>
              <button className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <IconMail className="w-4 h-4 mr-2" />
                Enviar por Email
              </button>
              <Link
                href={returnTo}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Transaction Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <IconFileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Información de la Transacción</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FECHA DE VENTA</label>
                  <div className="text-gray-900 font-medium">{formattedDate} - {formattedTime}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">MÉTODO DE PAGO</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="text-gray-400">Wait for API</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">MONEDA</label>
                  <div className="text-gray-900 font-medium">USD - Dólares Estadounidenses</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">PRECIO FINAL</label>
                  <div className="text-2xl font-bold text-blue-600">{money(sale.soldPrice)}</div>
                </div>
              </div>

              {sale.notes && (
                <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 italic">
                    "{sale.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Activity History (Mock) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <IconClock className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Historial de Actividades</h2>
                </div>
                <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">VER TODO</button>
              </div>

              <div className="space-y-6">
                {/* Mock List */}
                <div className="bg-blue-50/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">ACTIVIDAD</th>
                        <th className="px-4 py-3 text-left">FECHA</th>
                        <th className="px-4 py-3 text-left">RESUMEN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activities.map((act) => (
                        <tr key={act.id}>
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {act.type === 'call' && <IconPhone className="w-3 h-3 text-blue-500" />}
                            {act.type === 'meeting' && <IconUser className="w-3 h-3 text-purple-500" />}
                            {act.title}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{act.date}</td>
                          <td className="px-4 py-3 text-gray-600">{act.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="space-y-6">

            {/* Vehicle Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {vehicleFull?.media?.[0] ? (
                  <img src={vehicleFull.media[0].url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin Imagen</div>
                )}
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  VENDIDO
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 pr-4">{vehicleTitle}</h3>
                  <Link href={`/inventory/${sale.vehicleId}`} className="text-blue-600 hover:text-blue-800">
                    <IconExternalLink className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mb-4">Modelo {vehicleFull?.year || vehicleBasic?.year || "N/A"}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">VIN</span>
                    <span className="font-medium text-gray-900 text-xs">{vehicleFull?.vin || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Marca</span>
                    <span className="font-medium text-gray-900">{vehicleFull?.brand?.name || vehicleBasic?.brand?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Kilometraje</span>
                    <span className="font-medium text-gray-900">{vehicleFull?.mileage ? `${vehicleFull.mileage} km` : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID Inventario</span>
                    <span className="font-medium text-blue-600">{vehicleFull?.publicId || vehicleBasic?.publicId || "#VEH-????"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <IconUser className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Participantes</h2>
              </div>

              <div className="space-y-6">
                {/* Vendedor */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">VENDEDOR</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {sellerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{sellerName}</p>
                      <p className="text-xs text-gray-500">Asesor de Ventas</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Cliente */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">CLIENTE / LEAD</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{customerName}</p>
                      <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 text-xs space-y-2">
                    {customerEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <IconMail className="w-3 h-3" />
                        <span>{customerEmail}</span>
                      </div>
                    )}
                    {customerPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <IconPhone className="w-3 h-3" />
                        <span>{customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
