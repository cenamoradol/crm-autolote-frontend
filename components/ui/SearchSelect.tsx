"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type SearchOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type Props = {
  label?: string;
  placeholder?: string;

  value: SearchOption | null;
  onChange: (opt: SearchOption | null) => void;

  // 👇 lo dejamos requerido, pero igual metemos guard runtime
  loadOptions: (q: string) => Promise<SearchOption[]>;

  minChars?: number;
  debounceMs?: number;
  disabled?: boolean;
  required?: boolean;

  hint?: string;
};

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchSelect({
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  loadOptions,
  minChars = 2,
  debounceMs = 250,
  disabled,
  required,
  hint,
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value?.label ?? "");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  // si cambia el value desde afuera, refleja en input
  useEffect(() => {
    setInput(value?.label ?? "");
  }, [value?.value, value?.label]);

  // cerrar al hacer click afuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const q = useDebounced(input.trim(), debounceMs);

  useEffect(() => {
    let alive = true;

    async function run() {
      setError(null);

      // si no está abierto, no consultamos
      if (!open) return;

      // ✅ guard runtime: si llega mal, no explota y te deja mensaje claro
      if (typeof loadOptions !== "function") {
        setLoading(false);
        setOptions([]);
        setError("loadOptions is not a function");
        return;
      }

      // si el texto es exactamente el label del seleccionado, no consultamos
      if (value && q === (value.label ?? "").trim()) {
        setOptions([]);
        return;
      }

      if (q.length < minChars) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await loadOptions(q);
        if (!alive) return;
        setOptions(res ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Error cargando opciones");
        setOptions([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [q, open, minChars, loadOptions, value]);

  const showDropdown = open && (loading || error || options.length > 0 || q.length >= minChars);

  const statusLine = useMemo(() => {
    if (!open) return null;
    if (loading) return "Buscando...";
    if (error) return error;
    if (q.length >= minChars && options.length === 0) return "Sin resultados";
    if (q.length > 0 && q.length < minChars) return `Escribe al menos ${minChars} caracteres`;
    return null;
  }, [open, loading, error, q.length, minChars, options.length]);

  function pick(opt: SearchOption) {
    onChange(opt);
    setInput(opt.label);
    setOpen(false);
    setOptions([]);
  }

  function clear() {
    onChange(null);
    setInput("");
    setOptions([]);
    setError(null);
  }

  return (
    <div ref={wrapRef} className="mb-3">
      {label ? (
        <label className="form-label">
          {label} {required ? <span className="text-danger">*</span> : null}
        </label>
      ) : null}

      <div className="input-group">
        <input
          className="form-control"
          placeholder={placeholder}
          value={input}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            // si el usuario escribe, se des-selecciona para evitar inconsistencia
            if (value) onChange(null);
          }}
        />

        {value || input ? (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clear}
            disabled={disabled}
            title="Limpiar"
          >
            ✕
          </button>
        ) : null}
      </div>

      {hint ? <div className="form-text">{hint}</div> : null}

      {showDropdown ? (
        <div className="border rounded mt-1 bg-white shadow-sm" style={{ maxHeight: 260, overflowY: "auto" }}>
          {statusLine ? <div className="px-3 py-2 text-muted small">{statusLine}</div> : null}

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="w-100 text-start btn btn-link text-decoration-none px-3 py-2"
              onClick={() => pick(opt)}
              style={{ color: "inherit" }}
            >
              <div className="fw-semibold">{opt.label}</div>
              {opt.sublabel ? <div className="small text-muted">{opt.sublabel}</div> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { SearchSelect };
