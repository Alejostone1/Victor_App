import { UI_STRINGS } from "@/lib/config";
import type { StreakInfo } from "@/lib/gamification/streak";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.home;

/** Llama de racha: encendida si ya practicó hoy, apagada si falta. */
export function StreakBadge({ streak, className }: { streak: StreakInfo; className?: string }) {
  const lit = streak.todayDone;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-3xl border-2 p-2.5 sm:p-3",
        lit ? "border-[#f97316] bg-[#fff1e6] dark:bg-[#3a2412]" : "border-border bg-surface",
        className,
      )}
    >
      <span className={cn("text-2xl sm:text-4xl", !lit && "opacity-50 grayscale")} aria-hidden="true">
        🔥
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase tracking-wide text-muted sm:text-sm">{t.streakLabel}</span>
        <span className="whitespace-nowrap text-lg font-extrabold leading-tight sm:text-2xl">
          {streak.current > 0 ? t.streakDays(streak.current) : t.streakNone}
        </span>
        <span className="text-xs leading-tight text-muted sm:text-sm">{lit ? t.streakTodayDone : t.streakTodayPending}</span>
      </div>
    </div>
  );
}
