import Link from "next/link";
import { BOARDS } from "@/lib/content/boards";
import { cn } from "@/lib/utils";

/** Tarjetas grandes de los tableros (Abecedario, Números, Colores). */
export function BoardCards({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")}>
      {BOARDS.map((board) => (
        <li key={board.id}>
          <Link
            href={`/explore/${board.id}`}
            className={cn(
              "flex h-full rounded-3xl text-white shadow-[0_5px_0_0_rgb(0_0_0/0.25)] transition-transform active:translate-y-1 active:shadow-none",
              compact ? "flex-col items-center gap-1 p-3 text-center" : "items-center gap-4 p-5 sm:flex-col sm:text-center",
            )}
            style={{ backgroundColor: board.color }}
          >
            <span aria-hidden="true" className={compact ? "text-4xl" : "text-5xl"}>
              {board.icon}
            </span>
            <span className="flex flex-col">
              <span className={cn("font-extrabold leading-tight", compact ? "text-base" : "text-2xl")}>{board.title}</span>
              <span lang="en" className={cn("opacity-85", compact ? "text-xs" : "text-base")}>
                {board.titleEn}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
