import "./globals.css";

export const metadata = {
  title: "CRM AutoLote",
  description: "Multi-tenant CRM AutoLote"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-light">{children}</body>
    </html>
  );
}
