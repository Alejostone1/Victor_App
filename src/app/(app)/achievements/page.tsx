import { Suspense } from "react";
import Link from "next/link";
import { APP_CONFIG, UI_STRINGS } from "@/lib/config";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { getUnlockedAchievements } from "@/lib/gamification/server";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.achievements;

export default function AchievementsPage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6 lg:max-w-5xl lg:p-8">
      <Link href="/progress" className="self-start text-lg font-bold text-primary">
        ← {UI_STRINGS.nav.progress}
      </Link>
      <h1 className="text-3xl font-extrabold">🏅 {t.title}</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <AchievementGrid />
      </Suspense>
    </section>
  );
}

async function AchievementGrid() {
  const unlocked = await getUnlockedAchievements();
  return (
    <>
      <p className="text-lg font-bold text-muted">{t.unlocked(unlocked.size, ACHIEVEMENTS.length)}</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked.get(a.id);
          return (
            <li
              key={a.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center",
                at ? "border-[#f5c542] bg-[#fff4d6] dark:bg-[#3a3012]" : "border-dashed border-border bg-surface",
              )}
            >
              <span className={cn("text-5xl", !at && "opacity-40 grayscale")} aria-hidden="true">
                {at ? a.icon : "🔒"}
              </span>
              <span className={cn("text-lg font-extrabold leading-tight", !at && "text-muted")}>{a.name}</span>
              <span className="text-sm text-muted">{a.condition}</span>
              {at && (
                <span className="text-xs font-bold text-[#8a5a00] dark:text-[#f5c542]">
                  ✓ {new Date(at).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: APP_CONFIG.timeZone })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
