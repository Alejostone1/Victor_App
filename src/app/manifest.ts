import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/config";

// TODO(Fase 4): íconos (192, 512, maskable) y colores definitivos.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: APP_CONFIG.theme.background,
    theme_color: APP_CONFIG.theme.primary,
    lang: "es",
    icons: [],
  };
}
