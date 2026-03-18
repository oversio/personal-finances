import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMA Finance - Simplifica tus Finanzas Personales",
  description:
    "Controla tus gastos, establece presupuestos y alcanza tus metas financieras con OMA Finance. La app de finanzas personales más intuitiva.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-50 font-sans text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
