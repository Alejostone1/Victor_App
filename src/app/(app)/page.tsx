import { Suspense } from "react";
import Link from "next/link";
import { DailyGoalRing } from "@/components/gamification/DailyGoalRing";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { BoardCards } from "@/components/explore/BoardCards";
import { ContinueSection, StagesSection } from "@/components/path/UnitPath";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { UI_STRINGS } from "@/lib/config";
import { addDays } from "@/lib/dates";
import { getActivitySummary, getReinforcement, getReviewCounts } from "@/lib/gamification/server";

const t = UI_STRINGS.home;

export default function HomePage() {
  // Celular: una columna. PC (lg): saludo con racha y meta a la derecha; debajo, "Continuar" y al lado
  // las tarjetas del día y los tableros; luego la ruta por etapas en 2–3 columnas.
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6 lg:max-w-6xl lg:gap-8 lg:p-8">
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-8">
        <Suspense fallback={<div className="h-56 animate-pulse rounded-3xl bg-border" />}>
          <ContinueSection />
        </Suspense>
        <div className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <TodayCards />
          </Suspense>
          <InstallAppCard variant="home" />
          <section className="flex flex-col gap-3" aria-labelledby="explore-title">
            <h2 id="explore-title" className="text-xl font-extrabold">
              👆 {UI_STRINGS.path.exploreBoardsTitle}
            </h2>
            <BoardCards compact />
          </section>
        </div>
      </div>
      <Suspense fallback={<HomeSkeleton />}>
        <StagesSection />
      </Suspense>
    </section>
  );
}

async function Greeting() {
  const [profile, activity] = await Promise.all([requireOnboardedProfile(), getActivitySummary()]);
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="flex items-center justify-between gap-4 lg:justify-start lg:gap-6">
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-muted" lang="en">
            Hello! 👋
          </p>
          <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl">¡Hola, {profile.display_name}!</h1>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff4d6] px-3 py-1 text-lg font-extrabold text-[#8a5a00] dark:bg-[#3a3012] dark:text-[#f5c542]">
          ⭐ {profile.total_xp} XP
        </span>
      </div>
      <div className="flex flex-col gap-3 lg:w-[34rem] lg:shrink-0">
        {activity.streak.broken && (
          <p className="rounded-2xl bg-primary/10 p-4 text-lg font-bold">💙 {UI_STRINGS.welcomeBack(profile.display_name)}</p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StreakBadge streak={activity.streak} />
          <DailyGoalRing minutes={activity.minutesToday} goal={profile.daily_goal_minutes} />
        </div>
        {activity.streak.restDays.includes(addDays(activity.today, -1)) && (
          <p className="text-center text-sm text-muted">{t.restDayUsed}</p>
        )}
      </div>
    </header>
  );
}

/** "Repasar hoy" y "Refuerzo recomendado", solo si aplican. */
async function TodayCards() {
  const [reviews, reinforcement] = await Promise.all([getReviewCounts(), getReinforcement()]);
  if (reviews.due === 0 && !reinforcement) return null;
  return (
    <div className="flex flex-col gap-3">
      {reviews.due > 0 && (
        <Link
          href="/review/session"
          className="flex items-center gap-4 rounded-3xl border-2 border-success bg-success-soft p-4 shadow-[0_5px_0_0_var(--success)] transition-transform active:translate-y-1 active:shadow-none"
        >
          <span className="text-5xl" aria-hidden="true">
            🧠
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-xl font-extrabold leading-tight">{t.reviewTitle(reviews.due)}</span>
            <span className="text-muted">{t.reviewHint}</span>
          </span>
          <span className="text-3xl text-success" aria-hidden="true">
            ➜
          </span>
        </Link>
      )}
      {reinforcement && (
        <Link
          href={`/practice/${reinforcement.tag}`}
          className="flex items-center gap-4 rounded-3xl border-2 border-error bg-error-soft p-4 shadow-[0_5px_0_0_var(--error)] transition-transform active:translate-y-1 active:shadow-none"
        >
          <span className="text-5xl" aria-hidden="true">
            {reinforcement.icon}
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-bold uppercase tracking-wide text-muted">💪 {t.reinforceTitle}</span>
            <span className="text-xl font-extrabold leading-tight">{reinforcement.title}</span>
            <span className="text-muted">{t.reinforceHint(reinforcement.errors)}</span>
          </span>
          <span className="text-3xl text-error" aria-hidden="true">
            ➜
          </span>
        </Link>
      )}
    </div>
  );
}

function GreetingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-border" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-3xl bg-border" />
        <div className="h-24 animate-pulse rounded-3xl bg-border" />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-44 w-full animate-pulse rounded-3xl bg-border" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-border" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-3xl bg-border" />
        ))}
      </div>
    </div>
  );
}
