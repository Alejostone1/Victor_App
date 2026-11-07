import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/config";

// Manifest de la app instalable. Íconos generados con `npm run icons` (scripts/generate-icons.mjs).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${APP_CONFIG.name} · Inglés paso a paso`,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: APP_CONFIG.theme.background,
    theme_color: APP_CONFIG.theme.primary,
    lang: "es",
    dir: "ltr",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Repasar palabras", short_name: "Repasar", url: "/review", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Explorar: abecedario, números y colores", short_name: "Explorar", url: "/explore", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
