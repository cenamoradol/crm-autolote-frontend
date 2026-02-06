import "./globals.css";



export const metadata = {
  title: "CRM AutoLote",
  description: "Multi-tenant CRM AutoLote"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="light" lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
        {children}
      </body>
    </html>
  );
}
