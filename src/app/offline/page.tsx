import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sin conexión" };

/**
 * Página que muestra el service worker cuando no hay internet. Es estática y no necesita
 * JavaScript: el botón es un enlace normal que vuelve a intentar abrir el inicio.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="text-8xl" aria-hidden="true">
        📶
      </span>
      <h1 className="text-3xl font-extrabold">No hay conexión a internet</h1>
      <p className="text-lg text-muted">
        EnglishPath necesita internet para guardar tu progreso y escuchar tu voz. Revisa el wifi o los datos y vuelve a
        intentarlo.
      </p>
      {/* Enlace normal a propósito: debe recargar la página completa (aquí puede no haber JavaScript). */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="inline-flex min-h-touch w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.18)]"
      >
        🔄 Intentar de nuevo
      </a>
      <p className="text-sm text-muted">Tranquilo: las lecciones que ya terminaste están guardadas.</p>
    </main>
  );
}
