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

export function lessonIcon(lesson: Lesson): string {
  return lesson.icon ?? LESSON_ICONS[lesson.type];
}

const t = UI_STRINGS.path;

type Props = { lesson: Lesson; number: number; state: NodeState; bestScore?: number; offset: number; color: string };

/** Nodo redondo del camino: completado (verde), actual (color del tema, con aviso) o bloqueado (gris). */
export function LessonNode({ lesson, number, state, bestScore, offset, color }: Props) {
  const circle = (
    <span
      className={cn(
        "relative flex size-24 items-center justify-center rounded-full text-5xl transition-transform",
        state === "completed" && "bg-success shadow-[0_7px_0_0_#11803a] group-hover:-translate-y-0.5",
        state === "current" && "shadow-[0_7px_0_0_rgb(0_0_0/0.3)] ring-8 group-hover:-translate-y-0.5",
        state === "locked" && "bg-border shadow-[0_7px_0_0_rgb(0_0_0/0.12)]",
      )}
      style={state === "current" ? { backgroundColor: color, ["--tw-ring-color" as string]: `${color}33` } : undefined}
    >
      <span aria-hidden="true" className={cn(state === "locked" && "opacity-50 grayscale")}>
        {lessonIcon(lesson)}
      </span>
      {state === "completed" && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border-4 border-background bg-success text-lg font-black text-white"
        >
          ✓
        </span>
      )}
      {state === "locked" && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border-4 border-background bg-surface text-base"
        >
          🔒
        </span>
      )}
    </span>
  );

  const label = (
    <span className="flex flex-col items-center">
      <span className={cn("max-w-48 text-center text-lg font-extrabold leading-tight", state === "locked" && "text-muted")}>
        {number}. {lesson.title}
      </span>
      <span className="text-sm font-semibold text-muted">
        {state === "completed" && bestScore !== undefined ? `✓ ${t.bestScore(bestScore)}` : t.lessonTypes[lesson.type]}
      </span>
    </span>
  );

  return (
    <div className="relative flex flex-col items-center gap-2" style={{ transform: `translateX(${offset}px)` }}>
      {state === "current" && (
        <span
          className="mb-1 animate-bounce rounded-xl bg-surface px-3 py-1 text-base font-extrabold shadow-md ring-2"
          style={{ color, ["--tw-ring-color" as string]: color }}
        >
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
