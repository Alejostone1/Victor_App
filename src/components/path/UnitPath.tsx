import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import type { RoadmapEntry, Unit } from "@/lib/content/schema";
import { UI_STRINGS } from "@/lib/config";
import { getAllLessons, getUnits, getUpcomingUnits } from "@/lib/content/loader";
import { getLessonProgress } from "@/lib/progress";
import { LESSON_ICONS, LessonNode, type NodeState } from "./LessonNode";

const t = UI_STRINGS.path;
/** Desplazamientos horizontales del camino en zigzag (px). */
const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56];

/** Camino de unidades con el progreso real del usuario. Lee la sesión: usar dentro de <Suspense>. */
export async function UnitPath() {
  const { completed, bestScores } = await getLessonProgress();
  const current = getAllLessons().find(({ lesson }) => !completed.has(lesson.id));

  function stateOf(lessonId: string): NodeState {
    if (completed.has(lessonId)) return "completed";
    return lessonId === current?.lesson.id ? "current" : "locked";
  }

  return (
    <div className="flex flex-col gap-10">
      {current && (
        <Link
          href={`/lesson/${current.lesson.id}`}
          className="group flex items-center gap-4 rounded-3xl border-2 border-primary bg-surface p-4 shadow-[0_5px_0_0_var(--primary)] transition-transform active:translate-y-1 active:shadow-none"
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-4xl" aria-hidden="true">
            {LESSON_ICONS[current.lesson.type]}
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-bold uppercase tracking-wide text-muted">
              {completed.size === 0 ? t.start : t.continue}
            </span>
            <span className="text-xl font-extrabold">{current.lesson.title}</span>
            <span className="text-muted">{current.unit.title}</span>
          </span>
          <span className="text-3xl text-primary transition-transform group-hover:translate-x-1" aria-hidden="true">
            ➜
          </span>
        </Link>
      )}

      {getUnits().map((unit) => (
        <section key={unit.id} className="flex flex-col gap-6" aria-labelledby={`unit-${unit.id}`}>
          <UnitBanner unit={unit} done={unit.lessons.filter((l) => completed.has(l.id)).length} />
          <ol className="flex flex-col items-center gap-7 py-2">
            {unit.lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <LessonNode
                  lesson={lesson}
                  state={stateOf(lesson.id)}
                  bestScore={bestScores.get(lesson.id)}
                  offset={ZIGZAG[i % ZIGZAG.length]}
                />
              </li>
            ))}
          </ol>
        </section>
      ))}

      {getUpcomingUnits().map((entry) => (
        <UpcomingUnit key={entry.order} entry={entry} />
      ))}
    </div>
  );
}

function UnitBanner({ unit, done }: { unit: Unit; done: number }) {
  const total = unit.lessons.length;
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_6px_0_0_#1d4ed8]">
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-4xl" aria-hidden="true">
          {unit.icon}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wide opacity-80">
            {t.unitLabel(unit.order)} · {unit.level}
          </span>
          <h2 id={`unit-${unit.id}`} className="text-2xl font-extrabold leading-tight">
            {unit.title}
          </h2>
          <span lang="en" className="opacity-85">
            {unit.titleEn}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-sm font-bold">{t.lessonsDone(done, total)}</span>
      </div>
      <Link
        href={`/unit/${unit.id}`}
        className={buttonClasses("secondary", "min-h-11 border-white/40 bg-white/10 py-2 text-base text-primary-foreground hover:bg-white/20")}
      >
        {t.viewUnit}
      </Link>
    </div>
  );
}

function UpcomingUnit({ entry }: { entry: RoadmapEntry }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-border p-4 opacity-75">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-border text-3xl grayscale" aria-hidden="true">
        {entry.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-bold uppercase tracking-wide text-muted">
          {t.unitLabel(entry.order)} · {t.upcoming}
        </span>
        <span className="text-lg font-extrabold">{entry.title}</span>
        <span className="text-sm text-muted">{entry.goal}</span>
      </div>
    </div>
  );
}
