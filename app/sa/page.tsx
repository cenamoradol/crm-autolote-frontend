import Link from "next/link";

export default function SaHome() {
  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-1">Panel SuperAdmin</h5>
            <p className="text-muted mb-0">
              Desde aquí creas Stores, Users y das soporte entrando a una Store seleccionada.
            </p>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="mb-2">Stores</h6>
            <p className="text-muted">Crear y administrar autolotes (dominios, branches y miembros).</p>
            <Link className="btn btn-primary" href="/sa/stores">
              Ir a Stores
            </Link>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h6 className="mb-2">Users</h6>
            <p className="text-muted">Crear usuarios y asignarlos a stores con roles (admin/supervisor/seller).</p>
            <Link className="btn btn-primary" href="/sa/users">
              Ir a Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
