"use client";

export function LoadingButton({
  loading,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) {
  return (
    <button className={className} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="d-inline-flex align-items-center gap-2">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          Procesando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
