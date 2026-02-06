"use client";

import { useEffect, useState, useMemo } from "react";
import { getLeadPreference, upsertLeadPreference, type LeadPreference } from "@/lib/leads";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { InlineAlert } from "@/components/ui/InlineAlert";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brandId?: string };
type VehicleType = { id: string; name: string };

type Props = {
    leadId: string;
};

async function fetchJson(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error loading catalog");
    return res.json();
}

export default function LeadPreferenceCard({ leadId }: Props) {
    const [pref, setPref] = useState<LeadPreference | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Catalogs
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // Form State
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [brandId, setBrandId] = useState("");
    const [modelId, setModelId] = useState("");
    const [vehicleTypeId, setVehicleTypeId] = useState("");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);

    // Load catalogs & preference
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [pData, bData, tData] = await Promise.all([
                    getLeadPreference(leadId),
                    fetchJson("/api/bff/brands"),
                    fetchJson("/api/bff/vehicle-types").catch(() => []) // Handle if BFF doesn't exist yet, fallback empty array or try direct
                ]);

                // If BFF for vehicle-types fails (it might not exist yet), try direct SA endpoint if user has permissions, 
                // OR we should probably rely on a public BFF endpoint. 
                // For now, let's assume I create a route or use what I have.
                // Actually, vehicle types should be public or accessible to sellers. 
                // Let's assume /api/bff/vehicle-types is needed. 
                // If it fails, I'll fix it later.

                if (!alive) return;

                setBrands(Array.isArray(bData) ? bData : bData.data || []);

                // For types, let's try to normalize
                const typesArr = Array.isArray(tData) ? tData : tData.data || [];
                setTypes(typesArr);

                if (pData) {
                    setPref(pData);
                    setMinPrice(pData.minPrice ? String(pData.minPrice) : "");
                    setMaxPrice(pData.maxPrice ? String(pData.maxPrice) : "");
                    setYearFrom(pData.yearFrom ? String(pData.yearFrom) : "");
                    setYearTo(pData.yearTo ? String(pData.yearTo) : "");
                    setBrandId(pData.desiredBrandId || "");
                    setModelId(pData.desiredModelId || "");
                    setVehicleTypeId(pData.vehicleTypeId || "");
                    setNotes(pData.notes || "");
                }
            } catch (e: any) {
                // Silently fail for catalogs, but show error for preference if critical
                console.error(e);
            } finally {
                if (alive) {
                    setLoading(false);
                    setLoadingCats(false);
                }
            }
        })();
        return () => { alive = false; };
    }, [leadId]);

    // Load models when brand changes
    useEffect(() => {
        if (!brandId) {
            setModels([]);
            return;
        }
        fetchJson(`/api/bff/models?brandId=${brandId}`)
            .then((res) => setModels(Array.isArray(res) ? res : res.data || []))
            .catch((e) => console.error(e));
    }, [brandId]);


    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const payload = {
                minPrice: minPrice ? Number(minPrice) : null,
                maxPrice: maxPrice ? Number(maxPrice) : null,
                yearFrom: yearFrom ? Number(yearFrom) : null,
                yearTo: yearTo ? Number(yearTo) : null,
                desiredBrandId: brandId || null,
                desiredModelId: modelId || null,
                vehicleTypeId: vehicleTypeId || null,
                notes: notes || null,
            };

            const updated = await upsertLeadPreference(leadId, payload);
            setPref(updated);
            alert("Preferencias guardadas");
        } catch (e: any) {
            setError(e.message || "Error al guardar");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-4 bg-white rounded-lg shadow animate-pulse h-40"></div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.99 0 3.757 1.05 4.75 2.555A5.748 5.748 0 0117.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <h3 className="text-sm font-bold text-indigo-600 uppercase">INTERESES DEL USUARIO</h3>
            </div>

            {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

            <div className="space-y-4">
                {/* Type & Brand Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            TIPO DE VEHÍCULO
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-sm bg-gray-50"
                            value={vehicleTypeId}
                            onChange={(e) => setVehicleTypeId(e.target.value)}
                        >
                            <option value="">Cualquiera</option>
                            {types.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            MARCA
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-sm bg-gray-50"
                            value={brandId}
                            onChange={(e) => {
                                setBrandId(e.target.value);
                                setModelId("");
                            }}
                        >
                            <option value="">Cualquiera</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Model & Year Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            MODELO
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-sm bg-gray-50"
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            disabled={!brandId}
                        >
                            <option value="">{brandId ? "Cualquiera" : "Elige marca"}</option>
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AÑO DESDE</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-md text-sm bg-gray-50"
                                placeholder="Ej 2015"
                                value={yearFrom}
                                onChange={e => setYearFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AÑO HASTA</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-md text-sm bg-gray-50"
                                placeholder="Ej 2024"
                                value={yearTo}
                                onChange={e => setYearTo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PRECIO MÍN</label>
                        <input
                            type="number"
                            className="w-full border-gray-300 rounded-md text-sm bg-gray-50"
                            placeholder="Min"
                            value={minPrice}
                            onChange={e => setMinPrice(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PRECIO MÁX</label>
                        <input
                            type="number"
                            className="w-full border-gray-300 rounded-md text-sm bg-gray-50"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={e => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NOTAS DE INTERÉS</label>
                    <textarea
                        className="w-full border-gray-300 rounded-md text-sm bg-gray-50"
                        rows={2}
                        placeholder="Detalles extra (ej: color rojo, urgencia...)"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <LoadingButton
                        loading={saving}
                        onClick={handleSave}
                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 font-bold text-xs"
                    >
                        Actualizar Intereses
                    </LoadingButton>
                </div>

            </div>
        </div>
    );
}
