"use client";

export function InlineAlert({
  type = "danger",
  message,
  onClose
}: {
  type?: "danger" | "warning" | "success" | "info";
  message: string;
  onClose?: () => void;
}) {
  return (
    <div className={`alert alert-${type} d-flex justify-content-between align-items-center`} role="alert">
      <div>{message}</div>
      {onClose && (
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
          Cerrar
        </button>
      )}
    </div>
  );
}
