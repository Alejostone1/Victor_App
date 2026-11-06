import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
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
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.theme.primary,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
