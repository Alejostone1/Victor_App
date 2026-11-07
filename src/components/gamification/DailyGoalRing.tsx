import { UI_STRINGS } from "@/lib/config";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.home;
const R = 26;
const C = 2 * Math.PI * R;

/** Anillo con los minutos de hoy frente a la meta diaria. */
export function DailyGoalRing({ minutes, goal, className }: { minutes: number; goal: number; className?: string }) {
  const ratio = Math.min(1, goal > 0 ? minutes / goal : 0);
  const done = ratio >= 1;
  return (
    <div className={cn("flex items-center gap-2 rounded-3xl border-2 border-border bg-surface p-2.5 sm:p-3", done && "border-success", className)}>
      <svg
        viewBox="0 0 64 64"
        className="size-10 shrink-0 -rotate-90 sm:size-14"
        role="img"
        aria-label={t.goalMinutes(minutes, goal)}
      >
        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          stroke="var(--success)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(90 32 32)"
          className="fill-current text-[22px]"
        >
          {done ? "✓" : "🎯"}
        </text>
      </svg>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase tracking-wide text-muted sm:text-sm">{t.goalLabel}</span>
        <span className="whitespace-nowrap text-lg font-extrabold leading-tight sm:text-2xl">{t.goalMinutes(minutes, goal)}</span>
        {done && <span className="text-xs leading-tight text-success sm:text-sm">{t.goalDone}</span>}
      </div>
    </div>
  );
}
