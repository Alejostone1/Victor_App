import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

// Pantallas que todavía se están construyendo: mensaje amable y un camino de vuelta.
type PlaceholderProps = {
  title: string;
  /** Fase en la que llega (solo para el equipo; no se muestra). */
  phase: string;
  icon?: string;
};

export function Placeholder({ title, icon = "🚧" }: PlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 p-6 pt-16 text-center">
      <span className="text-7xl" aria-hidden="true">
        {icon}
      </span>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="max-w-sm text-lg text-muted">Esta sección llega muy pronto. Mientras tanto, sigue con tus lecciones o explora el abecedario, los números y los colores.</p>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/" className={buttonClasses("primary")}>
          📚 Ir a mis lecciones
        </Link>
        <Link href="/explore" className={buttonClasses("secondary")}>
          🧭 Explorar
        </Link>
      </div>
    </section>
  );
}
