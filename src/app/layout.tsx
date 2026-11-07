import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { APP_CONFIG } from "@/lib/config";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  applicationName: APP_CONFIG.name,
  // iPhone: al "Agregar a pantalla de inicio" abre a pantalla completa con este ícono.
  appleWebApp: { capable: true, title: APP_CONFIG.name, statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.theme.primary,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
