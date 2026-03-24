"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { EventMedia, getEventMedia, setEventMediaCover, deleteEventMedia } from "@/lib/events";

export default function EventMediaManager({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState<string | null>(null);
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
      const data = await getEventMedia(eventId);
      setItems(data || []);
      if (!data || data.length === 0) setInfo("El evento no tiene ninguna imagen.");
    } catch (e: any) {
      setErr(e?.message || "Error cargando imágenes del evento.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!eventId) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function setCover(mediaId: string) {
    setErr(null);
    setInfo(null);
    setSuccess(null);
    try {
      await setEventMediaCover(eventId, mediaId);
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
      await deleteEventMedia(eventId, mediaId);
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

          while (blob.size > 3.8 * 1024 * 1024) {
            console.warn(`[WebP] Tamaño ${blob.size / 1024 / 1024}MB excede límite. Ajustando...`);
            if (quality > 0.5) quality -= 0.15;
            else scale *= 0.8;
            blob = await tryConvert(img, scale, quality);
            if (scale < 0.2) break;
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

        const isImage = file.type.startsWith("image/");
        if (isImage) {
          setInfo(`Preparando imagen ${count}/${total}...`);
          try {
            file = await convertToWebp(file);
          } catch (convErr) {
            console.error("Error convirtiendo a WebP:", convErr);
          }
        }

        setInfo(`Subiendo imagen ${count}/${total}...`);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("isCover", "false");
        fd.append("kind", "IMAGE");

        const res = await fetch(`/api/bff/events/${eventId}/media/upload`, {
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Galería del Evento</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? "Cargando..." : sorted.length > 0 ? `${sorted.length} imagen(es)` : "Sin imágenes"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            multiple 
            onChange={(e) => setFiles(e.target.files)} 
            className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-300 transition-colors"
          />

          <LoadingButton
            loading={uploading}
            onClick={uploadSelected}
            disabled={!files || files.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            Subir
          </LoadingButton>

          <button 
            onClick={fetchList} 
            disabled={loading || uploading}
            className="text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>

      {success && <div className="mb-4"><InlineAlert type="success" message={success} onClose={() => setSuccess(null)} /></div>}
      {info && <div className="mb-4"><InlineAlert type="info" message={info} onClose={() => setInfo(null)} /></div>}
      {err && <div className="mb-4"><InlineAlert type="danger" message={err} onClose={() => setErr(null)} /></div>}

      {!loading && !err && sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sorted.map((m) => (
            <div key={m.id} className="group relative border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 flex flex-col">
              <div className="relative aspect-[4/3]">
                <img
                  src={m.url}
                  alt="event media"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => setCover(m.id)} 
                        disabled={uploading}
                        className="p-2 bg-white/90 text-blue-600 hover:bg-white rounded-full transition-colors"
                        title="Hacer Portada"
                    >
                        <span className="material-symbols-outlined text-[18px]">imagesmode</span>
                    </button>
                    <button 
                        onClick={() => removeMedia(m.id)} 
                        disabled={uploading}
                        className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-full transition-colors"
                        title="Eliminar"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
                {m.isCover && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Portada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
