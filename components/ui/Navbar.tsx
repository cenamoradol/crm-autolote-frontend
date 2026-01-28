"use client";

export function Navbar({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container-fluid">
        <span className="navbar-brand fw-semibold">{title}</span>
        <div className="ms-auto d-flex align-items-center gap-2">{right}</div>
      </div>
    </nav>
  );
}
