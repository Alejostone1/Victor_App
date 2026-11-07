import { Suspense } from "react";
import { HomeContent } from "@/components/path/UnitPath";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { UI_STRINGS } from "@/lib/config";

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6">
      <Suspense fallback={<div className="h-24 animate-pulse rounded-3xl bg-border" />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </section>
  );
}

async function Greeting() {
  const profile = await requireOnboardedProfile();
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <p className="text-lg font-semibold text-muted" lang="en">
          Hello! 👋
        </p>
        <h1 className="text-3xl font-extrabold leading-tight">¡Hola, {profile.display_name}!</h1>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-lg font-extrabold text-[#8a5a00] dark:bg-[#3a3012] dark:text-[#f5c542]">
          ⭐ {profile.total_xp} XP
        </span>
        <span className="text-sm text-muted">{UI_STRINGS.path.dailyGoal(profile.daily_goal_minutes)}</span>
      </div>
    </header>
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
