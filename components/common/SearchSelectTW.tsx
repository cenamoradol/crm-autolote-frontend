"use client";

import React, { useState, useEffect, useRef } from "react";

function IconSearch({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

interface Option {
    value: string;
    label: string;
    sublabel?: string;
}

interface SearchSelectTWProps {
    label?: string;
    placeholder?: string;
    value: Option | null;
    onChange: (opt: Option | null) => void;
    loadOptions: (query: string) => Promise<Option[]>;
    disabled?: boolean;
}

export default function SearchSelectTW({
    label,
    placeholder = "Buscar...",
    value,
    onChange,
    loadOptions,
    disabled
}: SearchSelectTWProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    useEffect(() => {
        if (!open) return;
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await loadOptions(query);
                if (alive) setOptions(res);
            } catch {
                if (alive) setOptions([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [query, open, loadOptions]);

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div
                className={`relative w-full border rounded-md shadow-sm bg-white py-2 px-3 cursor-pointer flex justify-between items-center ${disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-blue-400 border-gray-300"}`}
                onClick={() => !disabled && setOpen(!open)}
            >
                <div className="flex-1 truncate">
                    {value ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{value.label}</span>
                            {value.sublabel && <span className="text-xs text-gray-500">{value.sublabel}</span>}
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center flex-shrink-0 ml-2">
                    <IconSearch className="w-4 h-4 text-gray-400" />
                    {value && !disabled && (
                        <button
                            className="ml-1 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 flex items-center justify-center focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            className="w-full text-sm py-1 px-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Escribe para buscar..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Buscando...</div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">No se encontraron resultados</div>
                        ) : (
                            options.map(opt => (
                                <div
                                    key={opt.value}
                                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        onChange(opt);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                >
                                    <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                                    {opt.sublabel && <div className="text-xs text-gray-500">{opt.sublabel}</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
