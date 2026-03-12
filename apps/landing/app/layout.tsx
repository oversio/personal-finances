import type { Metadata } from "next";
import { Providers } from "./_providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMA Finance - Gestiona tus finanzas de forma inteligente",
  description:
    "Controla ingresos, gastos e inversiones en un solo lugar. Visualiza tu patrimonio y alcanza tus metas financieras con OMA Finance.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "presupuesto",
    "ahorro",
    "inversiones",
    "patrimonio",
  ],
  openGraph: {
    title: "OMA Finance - Gestiona tus finanzas de forma inteligente",
    description:
      "Controla ingresos, gastos e inversiones en un solo lugar. Visualiza tu patrimonio y alcanza tus metas financieras.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
