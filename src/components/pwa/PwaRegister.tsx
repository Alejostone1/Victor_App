"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa";

/** Registra el service worker (y, al importar `@/lib/pwa`, empieza a escuchar el aviso de instalar). */
export function PwaRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
