import Link from "next/link";
import { BoardCards } from "@/components/explore/BoardCards";
import type { RoadmapEntry, Unit } from "@/lib/content/schema";
import { UI_STRINGS } from "@/lib/config";
import { getContinueLesson, getUnits, getUpcomingUnits, isLessonUnlocked } from "@/lib/content/loader";
import { getLessonProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { LessonNode, lessonIcon, type NodeState } from "./LessonNode";

const t = UI_STRINGS.path;
/** Desplazamientos horizontales del camino en zigzag (px). */
const ZIGZAG = [0, 60, 90, 60, 0, -60, -90, -60];

/** Inicio: continuar, cómo funciona, tableros y temas. Lee la sesión: usar dentro de <Suspense>. */
export async function HomeContent() {
  const { completed, lastLessonId } = await getLessonProgress();
  const current = getContinueLesson(completed, lastLessonId);
  const isNew = completed.size === 0;

  return (
    <div className="flex flex-col gap-8">
      {current && (
        <Link
          href={`/lesson/${current.lesson.id}`}
          className="group flex flex-col gap-4 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.3)] transition-transform active:translate-y-1 active:shadow-none"
          style={{ backgroundColor: current.unit.color }}
        >
          <span className="flex items-center gap-4">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-5xl" aria-hidden="true">
              {lessonIcon(current.lesson)}
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-bold uppercase tracking-wide opacity-85">
                {isNew ? t.start : t.continue} · {current.unit.title}
              </span>
              <span className="text-2xl font-extrabold leading-tight">{current.lesson.title}</span>
              <span className="opacity-85">{t.lessonTypes[current.lesson.type]} · ~5 min</span>
            </span>
          </span>
          <span className="flex min-h-touch items-center justify-center gap-2 rounded-2xl bg-white text-xl font-extrabold shadow-[0_4px_0_0_rgb(0_0_0/0.2)]" style={{ color: current.unit.color }}>
            ▶ {isNew ? "Empezar" : t.continue}
          </span>
        </Link>
      )}

      {isNew && <HowItWorks />}

      <section className="flex flex-col gap-3" aria-labelledby="explore-title">
        <h2 id="explore-title" className="text-2xl font-extrabold">
          👆 {t.exploreTitle}
        </h2>
        <BoardCards compact />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="topics-title">
        <div>
          <h2 id="topics-title" className="text-2xl font-extrabold">
            📚 {t.topicsTitle}
          </h2>
          <p className="text-muted">{t.topicsHint}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {getUnits().map((unit) => (
            <li key={unit.id}>
              <UnitCard unit={unit} done={unit.lessons.filter((l) => completed.has(l.id)).length} />
            </li>
          ))}
        </ul>
      </section>

      <UpcomingUnits entries={getUpcomingUnits()} />
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="how-title">
      <h2 id="how-title" className="text-xl font-extrabold">
        {t.howTitle}
      </h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {t.howSteps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl" aria-hidden="true">
              {step.icon}
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-extrabold">
                {i + 1}. {step.title}
              </span>
              <span className="text-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function UnitCard({ unit, done }: { unit: Unit; done: number }) {
  const total = unit.lessons.length;
  const complete = done === total;
  return (
    <Link
      href={`/unit/${unit.id}`}
      className="flex h-full flex-col gap-3 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.28)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
      style={{ backgroundColor: unit.color }}
    >
      <span className="flex items-start gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-4xl" aria-hidden="true">
          {unit.icon}
        </span>
        <span className="flex flex-1 flex-col">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide opacity-85">
            {t.unitLabel(unit.order)}
            {complete ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-success normal-case">✓ {t.unitDone}</span>
            ) : done === 0 ? (
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs normal-case">{t.unitNew}</span>
            ) : null}
          </span>
          <span className="text-2xl font-extrabold leading-tight">{unit.title}</span>
          <span lang="en" className="opacity-85">
            {unit.titleEn}
          </span>
        </span>
      </span>
      {unit.description && <span className="text-base opacity-90">{unit.description}</span>}
      <span className="mt-auto flex items-center gap-3">
        <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full rounded-full bg-white" style={{ width: `${(done / total) * 100}%` }} />
        </span>
        <span className="text-sm font-bold">{t.lessonsDone(done, total)}</span>
      </span>
    </Link>
  );
}

function UpcomingUnits({ entries }: { entries: readonly RoadmapEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="text-xl font-extrabold text-muted">
        🔜 {t.upcomingTitle}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map((entry) => (
          <li
            key={entry.order}
            className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-border p-3 text-center opacity-80"
          >
            <span className="text-3xl grayscale" aria-hidden="true">
              {entry.icon}
            </span>
            <span className="text-sm font-bold leading-tight">{entry.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Camino en zigzag de una unidad, con el estado real de cada lección. */
export async function UnitLessonPath({ unit }: { unit: Unit }) {
  const { completed, bestScores } = await getLessonProgress();
  const current = unit.lessons.find((l) => !completed.has(l.id));

  function stateOf(lessonId: string): NodeState {
    if (completed.has(lessonId)) return "completed";
    return lessonId === current?.id && isLessonUnlocked(lessonId, completed) ? "current" : "locked";
  }

  return (
    <ol className={cn("flex flex-col items-center gap-8 py-4")}>
      {unit.lessons.map((lesson, i) => (
        <li key={lesson.id}>
          <LessonNode
            lesson={lesson}
            number={i + 1}
            state={stateOf(lesson.id)}
            bestScore={bestScores.get(lesson.id)}
            offset={ZIGZAG[i % ZIGZAG.length]}
            color={unit.color}
          />
        </li>
      ))}
    </ol>
  );
}
