"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type MediaKind = "IMAGE" | "VIDEO";

export type VehicleMedia = {
  id: string;
  vehicleId: string;
  kind: MediaKind;
  url: string;
  fileKey?: string;
  position: number;
  isCover: boolean;
  createdAt?: string;
};

type ListResponse = { data: VehicleMedia[] };

export default function VehicleMediaManager({ vehicleId }: { vehicleId: string }) {
  const [items, setItems] = useState<VehicleMedia[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ err SOLO errores reales
  const [err, setErr] = useState<string | null>(null);

  // ✅ mensajes informativos/success por separado
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      if (a.position !== b.position) return a.position - b.position;
      return (a.createdAt || "").localeCompare(b.createdAt || "");
    });
  }, [items]);

  async function fetchList() {
    setLoading(true);
    setErr(null);
    setInfo(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/bff/vehicles/${vehicleId}/media`, {
        method: "GET",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`(${res.status}) ${text || "No se pudo cargar media"}`);
      }

      const json = (await res.json().catch(() => null)) as ListResponse | null;
      const data = Array.isArray(json?.data) ? json!.data : [];

      setItems(data);

      // ✅ vacío NO es error
      if (data.length === 0) setInfo("El vehículo no tiene ninguna imagen.");
    } catch (e: any) {
      setErr(e?.message || "Error cargando imágenes del vehículo.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!vehicleId) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  async function setCover(mediaId: string) {
    setErr(null);
    setInfo(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/${mediaId}/cover`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`No se pudo establecer portada. (${res.status}) ${t}`);
      }

      setSuccess("Portada actualizada.");
      await fetchList();
    } catch (e: any) {
      setErr(e?.message || "Error al poner portada.");
    }
  }

  async function removeMedia(mediaId: string) {
    setErr(null);
    setInfo(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/${mediaId}?deleteFile=true`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`No se pudo eliminar. (${res.status}) ${t}`);
      }

      setSuccess("Imagen eliminada.");
      await fetchList();
    } catch (e: any) {
      setErr(e?.message || "Error al eliminar imagen.");
    }
  }

  /** Convierte un File de imagen a WebP usando Canvas manteniendo dimensiones originales (con salvaguarda de tamaño Vercel) */
  async function convertToWebp(file: File): Promise<File> {
    const tryConvert = (img: HTMLImageElement, scale: number, quality: number): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Error al procesar Canvas WebP"));
        }, "image/webp", quality);
      });
    };

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      const objectUrl = URL.createObjectURL(file);
      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);
        try {
          let quality = 0.85;
          let scale = 1.0;
          let blob = await tryConvert(img, scale, quality);

          // Límite conservador de 3.8MB para esquivar el límite de Vercel de 4.5MB
          while (blob.size > 3.8 * 1024 * 1024) {
            console.warn(`[WebP] Tamaño ${blob.size / 1024 / 1024}MB excede límite. Ajustando...`);
            if (quality > 0.5) {
              quality -= 0.15; // Bajar compresión a 70%, luego 55%
            } else {
              scale *= 0.8; // Último recurso: Bajar tamaño un 20% (ej. fotos de 48 Megapixeles)
            }
            blob = await tryConvert(img, scale, quality);
            
            if (scale < 0.2) break; // Seguro contra bucle infinito
          }

          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
        } catch (e) {
          reject(e);
        }
      };
      img.src = objectUrl;
    });
  }

  async function uploadSelected() {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErr(null);
    setInfo(null);
    setSuccess(null);

    try {
      const fileArray = Array.from(files);
      const total = fileArray.length;
      let count = 0;

      for (let file of fileArray) {
        count++;

        // Convertir a WebP antes de subir
        const isImage = file.type.startsWith("image/");
        if (isImage) {
          setInfo(`Preparando imagen ${count}/${total}...`);
          try {
            const originalSize = (file.size / 1024 / 1024).toFixed(2);
            file = await convertToWebp(file);
            const newSize = (file.size / 1024 / 1024).toFixed(2);
            console.log(`✅ ${file.name}: ${originalSize}MB → ${newSize}MB (WebP)`);
          } catch (convErr) {
            console.error("Error convirtiendo a WebP:", convErr);
            // Si falla la conversión, subimos el original
          }
        }

        setInfo(`Subiendo imagen ${count}/${total}...`);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("isCover", "false");
        fd.append("kind", "IMAGE");

        const res = await fetch(`/api/bff/vehicles/${vehicleId}/media/upload`, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Error subiendo "${file.name}". (${res.status}) ${t.substring(0, 100)}`);
        }
      }

      setSuccess(total > 1 ? `${total} imágenes convertidas a WebP y subidas.` : "Imagen convertida a WebP y subida.");
      setFiles(null);
      await fetchList();
    } catch (e: any) {
      setErr(e?.message || "Error subiendo imagen(es).");
      await fetchList();
    } finally {
      setUploading(false);
      setInfo(null);
    }
  }

  return (
    <div className="card mt-3">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div>
            <h5 className="mb-1">Imágenes del vehículo</h5>
            <div className="text-muted small">
              {loading ? "Cargando..." : sorted.length > 0 ? `${sorted.length} imagen(es)` : "Sin imágenes"}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <input type="file" accept="image/jpeg, image/png, image/webp" multiple onChange={(e) => setFiles(e.target.files)} />

            <LoadingButton
              loading={uploading}
              className="btn btn-primary"
              onClick={uploadSelected}
              disabled={!files || files.length === 0}
            >
              Subir
            </LoadingButton>

            <button className="btn btn-outline-secondary" onClick={fetchList} disabled={loading || uploading}>
              Recargar
            </button>
          </div>
        </div>

        {/* ✅ success */}
        {success && (
          <div className="mt-3">
            <InlineAlert type="success" message={success} onClose={() => setSuccess(null)} />
          </div>
        )}

        {/* ✅ info (como “no hay imágenes”) */}
        {info && (
          <div className="mt-3">
            <InlineAlert type="info" message={info} onClose={() => setInfo(null)} />
          </div>
        )}

        {/* ✅ danger SOLO errores reales */}
        {err && (
          <div className="mt-3">
            <InlineAlert type="danger" message={err} onClose={() => setErr(null)} />
          </div>
        )}

        {!loading && !err && sorted.length > 0 && (
          <div className="row g-3 mt-2">
            {sorted.map((m) => (
              <div key={m.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="border rounded p-2 h-100">
                  <div className="position-relative">
                    <img
                      src={m.url}
                      alt="vehicle"
                      className="w-100"
                      style={{ height: 160, objectFit: "cover", borderRadius: 8 }}
                    />

                    {m.isCover && (
                      <span className="badge bg-success position-absolute" style={{ top: 8, left: 8 }}>
                        Portada
                      </span>
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setCover(m.id)} disabled={uploading}>
                      Hacer portada
                    </button>

                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeMedia(m.id)} disabled={uploading}>
                      Eliminar
                    </button>
                  </div>

                  <div className="small text-muted mt-2">Posición: {m.position}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
