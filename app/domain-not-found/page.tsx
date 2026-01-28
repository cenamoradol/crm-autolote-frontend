export default function DomainNotFound() {
  return (
    <div className="container py-5">
      <div className="alert alert-warning">
        <h5 className="mb-2">Dominio no reconocido</h5>
        <p className="mb-0">
          Este dominio no está registrado en el sistema. Verifica que exista en <code>StoreDomain</code> o entra por el dominio master.
        </p>
      </div>
    </div>
  );
}
