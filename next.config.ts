import path from "node:path";
import type { NextConfig } from "next";

/** Versión del despliegue: el service worker se registra con ella para actualizarse en cada deploy. */
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? `local-${Date.now()}`;

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  async headers() {
    return [
      {
        // El navegador siempre debe revisar si hay un service worker nuevo.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Fija la raíz del proyecto (hay un package-lock.json suelto en la carpeta de usuario).
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
