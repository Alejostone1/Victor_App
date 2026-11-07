import { Suspense } from "react";
import Link from "next/link";
import { UI_STRINGS } from "@/lib/config";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { getActivitySummary, getReviewCounts, getUnlockedAchievements } from "@/lib/gamification/server";
import { getLessonProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.progress;
const SKILLS = ["listening", "speaking", "vocabulary", "writing"] as const;
const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

export default function ProgressPage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold">📊 {t.title}</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <ProgressContent />
      </Suspense>
    </section>
  );
}

async function getSkillAccuracy(): Promise<Record<(typeof SKILLS)[number], { total: number; correct: number }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attempts")
    .select("skill, is_correct")
    .order("created_at", { ascending: false })
    .limit(1000);
  const acc = Object.fromEntries(SKILLS.map((s) => [s, { total: 0, correct: 0 }])) as Record<
    (typeof SKILLS)[number],
    { total: number; correct: number }
  >;
  for (const row of data ?? []) {
    const skill = row.skill as (typeof SKILLS)[number];
    if (!(skill in acc)) continue;
    acc[skill].total++;
    if (row.is_correct) acc[skill].correct++;
  }
  return acc;
}

async function ProgressContent() {
  const [activity, reviews, progress, unlocked, skills] = await Promise.all([
    getActivitySummary(),
    getReviewCounts(),
    getLessonProgress(),
    getUnlockedAchievements(),
    getSkillAccuracy(),
  ]);
  const maxMinutes = Math.max(5, ...activity.last14.map((d) => d.minutes));
  const anySkill = SKILLS.some((s) => skills[s].total > 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="📚" label={t.words} value={reviews.total} tone="bg-primary/10 border-primary" />
        <Stat icon="⏱️" label={t.minutes} value={activity.totalMinutes} tone="bg-success-soft border-success" />
        <Stat icon="✅" label={t.lessons} value={progress.completed.size} tone="bg-[#f3e8ff] border-[#7c3aed] dark:bg-[#2a1840]" />
        <Stat icon="🔥" label={t.streak} value={activity.streak.current} tone="bg-[#fff1e6] border-[#f97316] dark:bg-[#3a2412]" />
      </div>
      <p className="-mt-3 text-center text-sm font-semibold text-muted">🏆 {t.bestStreak(activity.streak.best)}</p>

      <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="chart-title">
        <div>
          <h2 id="chart-title" className="text-xl font-extrabold">
            {t.chartTitle}
          </h2>
          <p className="text-muted">{t.chartHint}</p>
        </div>
        <ol className="flex h-40 items-end gap-1.5" aria-label={t.chartHint}>
          {activity.last14.map((day) => {
            const isToday = day.date === activity.today;
            const weekday = WEEKDAYS[new Date(`${day.date}T00:00:00Z`).getUTCDay()];
            return (
              <li key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                {day.minutes > 0 && <span className="text-xs font-bold">{day.minutes}</span>}
                <span
                  className={cn("w-full rounded-t-lg", day.minutes > 0 ? (isToday ? "bg-success" : "bg-primary") : "bg-border")}
                  style={{ height: `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` }}
                  aria-label={`${day.date}: ${day.minutes} min`}
                />
                <span className={cn("text-xs", isToday ? "font-extrabold text-success" : "text-muted")}>{weekday}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="skills-title">
        <div>
          <h2 id="skills-title" className="text-xl font-extrabold">
            {t.skillsTitle}
          </h2>
          <p className="text-muted">{t.skillsHint}</p>
        </div>
        {anySkill ? (
          <ul className="flex flex-col gap-3">
            {SKILLS.map((skill) => {
              const { total, correct } = skills[skill];
              const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
              return (
                <li key={skill} className="flex flex-col gap-1">
                  <span className="flex justify-between font-bold">
                    <span>
                      {t.skillIcons[skill]} {t.skills[skill]}
                    </span>
                    <span className="text-muted">{total === 0 ? "—" : `${pct}%`}</span>
                  </span>
                  <span className="h-4 overflow-hidden rounded-full bg-border">
                    <span
                      className={cn("block h-full rounded-full", pct >= 70 ? "bg-success" : "bg-error")}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">{t.skillsEmpty}</p>
        )}
      </section>

      <Link
        href="/achievements"
        className="flex items-center gap-4 rounded-3xl border-2 border-[#f5c542] bg-[#fff4d6] p-4 shadow-[0_5px_0_0_#f5c542] transition-transform active:translate-y-1 active:shadow-none dark:bg-[#3a3012]"
      >
        <span className="text-5xl" aria-hidden="true">
          🏅
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-xl font-extrabold">{UI_STRINGS.achievements.viewAll}</span>
          <span className="text-muted">{UI_STRINGS.achievements.unlocked(unlocked.size, ACHIEVEMENTS.length)}</span>
        </span>
        <span className="text-3xl" aria-hidden="true">
          ➜
        </span>
      </Link>
    </>
  );
}

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: number; tone: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4", tone)}>
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <span className="text-3xl font-extrabold">{value}</span>
      <span className="text-sm font-bold uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}
