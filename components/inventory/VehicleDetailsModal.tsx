"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { getVehicle, type Vehicle } from "@/lib/vehicles";

function money(v: any) {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface DetailRowProps {
    label: string;
    value: string | number | null | undefined;
    icon?: string;
    isMono?: boolean;
}

function DetailRow({ label, value, icon, isMono }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
                {label}
            </div>
            <div className={`text-sm text-slate-900 dark:text-slate-100 font-medium ${isMono ? "font-mono" : ""}`}>
                {value || <span className="text-slate-400 italic">No especificado</span>}
            </div>
        </div>
    );
}

interface VehicleDetailsModalProps {
    vehicleId: string | null;
    onClose: () => void;
}

export function VehicleDetailsModal({ vehicleId, onClose }: VehicleDetailsModalProps) {
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (vehicleId) {
            setLoading(true);
            setError(null);
            getVehicle(vehicleId)
                .then(setVehicle)
                .catch((err) => {
                    console.error(err);
                    setError("No se pudieron cargar los detalles del vehículo.");
                })
                .finally(() => setLoading(false));
        } else {
            setVehicle(null);
        }
    }, [vehicleId]);

    const title = vehicle
        ? `${vehicle.year || ''} ${vehicle.brand?.name || ''} ${vehicle.model?.name || ''}`.trim() || 'Detalles del Vehículo'
        : 'Cargando...';

    return (
        <Modal
            isOpen={!!vehicleId}
            onClose={onClose}
            title={title}
            maxWidth="max-w-4xl"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
                    <span className="material-symbols-outlined text-4xl animate-spin text-blue-600">progress_activity</span>
                    <p className="text-sm font-medium">Cargando información...</p>
                </div>
            ) : error ? (
                <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="material-symbols-outlined text-4xl mb-2">error</span>
                    <p>{error}</p>
                    <button onClick={onClose} className="mt-4 text-sm font-bold text-red-700 hover:text-red-800 underline">
                        Cerrar
                    </button>
                </div>
            ) : vehicle ? (
                <div className="space-y-8">

                    {/* Header Status & Price */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${vehicle.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    vehicle.status === 'RESERVED' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                        vehicle.status === 'SOLD' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            'bg-slate-100 text-slate-700 border border-slate-200'}`}
                            >
                                {vehicle.status === 'AVAILABLE' ? 'Disponible' :
                                    vehicle.status === 'RESERVED' ? 'Reservado' :
                                        vehicle.status === 'SOLD' ? 'Vendido' : vehicle.status}
                            </span>

                            {vehicle.isPublished ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                    <span className="material-symbols-outlined text-[14px]">public</span> Publicado
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                    <span className="material-symbols-outlined text-[14px]">visibility_off</span> No Publicado
                                </span>
                            )}
                        </div>

                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {money(vehicle.price)}
                        </div>
                    </div>

                    {/* Media Section */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">imagesmode</span>
                            Galería
                        </h4>
                        {vehicle.media && vehicle.media.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {vehicle.media.map((m) => (
                                    <div key={m.id} className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={m.url}
                                            alt=""
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {m.isCover && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wide">
                                                Portada
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                                <span className="material-symbols-outlined text-3xl mb-1">no_photography</span>
                                <span className="text-xs">Sin imágenes</span>
                            </div>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">info</span>
                            Información General
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <DetailRow label="ID Público" value={vehicle.publicId} icon="fingerprint" isMono />
                            <DetailRow label="VIN / Serie" value={vehicle.vin} icon="tag" isMono />
                            <DetailRow label="Marca" value={vehicle.brand?.name} icon="branding_watermark" />
                            <DetailRow label="Modelo" value={vehicle.model?.name} icon="category" />
                            <DetailRow label="Año" value={vehicle.year} icon="calendar_today" />
                            <DetailRow label="Kilometraje" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null} icon="speed" />
                            <DetailRow label="Color" value={vehicle.color} icon="palette" />
                            <DetailRow label="Transmisión" value={vehicle.transmission} icon="settings" />
                            <DetailRow label="Combustible" value={vehicle.fuelType} icon="local_gas_station" />
                            <DetailRow label="Ubicación" value={vehicle.branch?.name} icon="store" />
                        </div>
                    </div>

                    {/* Description */}
                    {vehicle.description && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">description</span>
                                Descripción
                            </h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {vehicle.description}
                            </div>
                        </div>
                    )}

                    {/* Reservation Info */}
                    {vehicle.reservation && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">lock_clock</span>
                                Información de Reserva
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="block text-amber-600 dark:text-amber-400/70 font-semibold mb-1">Reservado Por</span>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                                        {vehicle.reservation.customer?.fullName || vehicle.reservation.lead?.fullName || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-amber-600 dark:text-amber-400/70 font-semibold mb-1">Fecha Reserva</span>
                                    <span className="text-slate-700 dark:text-slate-200">
                                        {new Date(vehicle.reservation.reservedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-amber-600 dark:text-amber-400/70 font-semibold mb-1">Vence</span>
                                    <span className="text-slate-700 dark:text-slate-200">
                                        {vehicle.reservation.expiresAt ? new Date(vehicle.reservation.expiresAt).toLocaleDateString() : "Indefinida"}
                                    </span>
                                </div>
                                {vehicle.reservation.notes && (
                                    <div className="col-span-full mt-2 pt-2 border-t border-amber-200/50">
                                        <span className="block text-amber-600 dark:text-amber-400/70 font-semibold mb-1">Notas</span>
                                        <p className="text-slate-700 dark:text-slate-300 italic">{vehicle.reservation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sale Info */}
                    {vehicle.sale && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">sell</span>
                                Información de Venta
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="block text-emerald-600 dark:text-emerald-400/70 font-semibold mb-1">Comprador</span>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                                        {vehicle.sale.customer?.fullName || vehicle.sale.lead?.fullName || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-emerald-600 dark:text-emerald-400/70 font-semibold mb-1">Fecha Venta</span>
                                    <span className="text-slate-700 dark:text-slate-200">
                                        {new Date(vehicle.sale.soldAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-emerald-600 dark:text-emerald-400/70 font-semibold mb-1">Precio Final</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                        {money(vehicle.sale.soldPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            ) : null}

            {/* Footer Actions */}
            {vehicle && (
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </Modal>
    );
}
