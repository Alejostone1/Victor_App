import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSON_ICONS } from "@/components/path/LessonNode";
import { buttonClasses } from "@/components/ui/Button";
import type { Unit } from "@/lib/content/schema";
import { UI_STRINGS } from "@/lib/config";
import { getUnit, getUnits, isLessonUnlocked } from "@/lib/content/loader";
import { getLessonProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.path;

export function generateStaticParams() {
  return getUnits().map((unit) => ({ unitId: unit.id }));
}

export default function UnitPage({ params }: PageProps<"/unit/[unitId]">) {
  // params se lee dentro de Suspense para que la navegación sea instantánea.
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6">
      <Link href="/" className="self-start text-lg font-bold text-primary">
        ← {UI_STRINGS.nav.home}
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <UnitContent params={params} />
      </Suspense>
    </section>
  );
}

async function UnitContent({ params }: { params: PageProps<"/unit/[unitId]">["params"] }) {
  const { unitId } = await params;
  const unit = getUnit(unitId);
  if (!unit) notFound();

  return (
    <>
      <header className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground">
        <span className="text-5xl" aria-hidden="true">
          {unit.icon}
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">{t.unitLabel(unit.order)}</p>
          <h1 className="text-3xl font-extrabold leading-tight">{unit.title}</h1>
          <p lang="en" className="opacity-85">
            {unit.titleEn}
          </p>
        </div>
      </header>
      <LessonList unit={unit} />
    </>
  );
}

async function LessonList({ unit }: { unit: Unit }) {
  const { completed, bestScores } = await getLessonProgress();

  return (
    <ol className="flex flex-col gap-4">
      {unit.lessons.map((lesson, i) => {
        const done = completed.has(lesson.id);
        const unlocked = isLessonUnlocked(lesson.id, completed);
        const words = lesson.vocab?.map((v) => v.en) ?? [];
        return (
          <li
            key={lesson.id}
            className={cn(
              "flex flex-col gap-3 rounded-3xl border-2 p-4",
              done ? "border-success bg-success-soft/40" : unlocked ? "border-primary bg-surface" : "border-border bg-surface opacity-70",
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl",
                  done ? "bg-success-soft" : unlocked ? "bg-primary/10" : "bg-border grayscale",
                )}
                aria-hidden="true"
              >
                {unlocked ? LESSON_ICONS[lesson.type] : "🔒"}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-bold uppercase tracking-wide text-muted">
                  {i + 1}. {t.lessonTypes[lesson.type]}
                </span>
                <span className="text-xl font-extrabold">{lesson.title}</span>
                {done && <span className="text-sm font-bold text-success">✓ {t.bestScore(bestScores.get(lesson.id) ?? 0)}</span>}
              </div>
            </div>
            {words.length > 0 && (
              <p lang="en" className="flex flex-wrap gap-2">
                {words.map((w) => (
                  <span key={w} className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
                    {w}
                  </span>
                ))}
              </p>
            )}
            {unlocked ? (
              <Link href={`/lesson/${lesson.id}`} className={buttonClasses(done ? "secondary" : "primary")}>
                {done ? t.practiceAgain : t.continue}
              </Link>
            ) : (
              <p className="text-sm text-muted">{t.locked}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
