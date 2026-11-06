import Link from "next/link";
import type { Lesson } from "@/lib/content/schema";
import { UI_STRINGS } from "@/lib/config";
import { cn } from "@/lib/utils";

export type NodeState = "completed" | "current" | "locked";

export const LESSON_ICONS: Record<Lesson["type"], string> = {
  learn: "📖",
  practice: "💪",
  dialogue: "💬",
  checkpoint: "🏆",
};

const t = UI_STRINGS.path;

type Props = { lesson: Lesson; state: NodeState; bestScore?: number; offset: number };

/** Nodo redondo del camino: completado (verde), actual (azul, con aviso) o bloqueado (gris). */
export function LessonNode({ lesson, state, bestScore, offset }: Props) {
  const circle = (
    <span
      className={cn(
        "relative flex size-20 items-center justify-center rounded-full text-4xl transition-transform",
        state === "completed" && "bg-success shadow-[0_6px_0_0_#11803a] group-hover:-translate-y-0.5",
        state === "current" && "bg-primary shadow-[0_6px_0_0_#1d4ed8] ring-8 ring-primary/20 group-hover:-translate-y-0.5",
        state === "locked" && "bg-border shadow-[0_6px_0_0_rgb(0_0_0/0.12)]",
      )}
    >
      <span aria-hidden="true" className={cn(state === "locked" && "opacity-60 grayscale")}>
        {state === "locked" ? "🔒" : LESSON_ICONS[lesson.type]}
      </span>
      {state === "completed" && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-4 border-background bg-success text-base font-black text-white"
        >
          ✓
        </span>
      )}
    </span>
  );

  const label = (
    <span className="flex flex-col items-center">
      <span className={cn("max-w-44 text-center text-lg font-bold leading-tight", state === "locked" && "text-muted")}>
        {lesson.title}
      </span>
      <span className="text-sm text-muted">
        {state === "completed" && bestScore !== undefined ? t.bestScore(bestScore) : t.lessonTypes[lesson.type]}
      </span>
    </span>
  );

  return (
    <div className="relative flex flex-col items-center gap-2" style={{ transform: `translateX(${offset}px)` }}>
      {state === "current" && (
        <span className="mb-1 animate-bounce rounded-xl bg-surface px-3 py-1 text-base font-extrabold text-primary shadow-md ring-2 ring-primary">
          {t.start}
        </span>
      )}
      {state === "locked" ? (
        <div className="flex flex-col items-center gap-2" aria-disabled="true" title={t.locked}>
          {circle}
          {label}
          <span className="sr-only">{t.locked}</span>
        </div>
      ) : (
        <Link href={`/lesson/${lesson.id}`} className="group flex flex-col items-center gap-2 rounded-3xl p-1">
          {circle}
          {label}
        </Link>
      )}
    </div>
  );
}
