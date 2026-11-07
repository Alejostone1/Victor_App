import Link from "next/link";
import type { RoadmapEntry, Unit } from "@/lib/content/schema";
import { UI_STRINGS } from "@/lib/config";
import { getContinueLesson, getStages, isLessonUnlocked } from "@/lib/content/loader";
import { getLessonProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { LessonNode, lessonIcon, type NodeState } from "./LessonNode";

const t = UI_STRINGS.path;
/** Desplazamientos horizontales del camino en zigzag (px). */
const ZIGZAG = [0, 60, 90, 60, 0, -60, -90, -60];

/** Tarjeta grande "Empezar/Continuar" y, la primera vez, "¿Cómo funciona?". Usar dentro de <Suspense>. */
export async function ContinueSection() {
  const { completed, lastLessonId } = await getLessonProgress();
  const current = getContinueLesson(completed, lastLessonId);
  const isNew = completed.size === 0;

  return (
    <div className="flex flex-col gap-6">
      {current && (
        <Link
          href={`/lesson/${current.lesson.id}`}
          className="group flex flex-col gap-4 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.3)] transition-transform active:translate-y-1 active:shadow-none lg:p-7"
          style={{ backgroundColor: current.unit.color }}
        >
          <span className="flex items-center gap-4">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-5xl lg:size-24 lg:text-6xl" aria-hidden="true">
              {lessonIcon(current.lesson)}
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-bold uppercase tracking-wide opacity-85">
                {isNew ? t.start : t.continue} · {current.unit.title}
              </span>
              <span className="text-2xl font-extrabold leading-tight lg:text-3xl">{current.lesson.title}</span>
              <span className="opacity-85">
                {t.lessonTypes[current.lesson.type]} · ~5 min
              </span>
            </span>
          </span>
          <span
            className="flex min-h-touch items-center justify-center gap-2 rounded-2xl bg-white text-xl font-extrabold shadow-[0_4px_0_0_rgb(0_0_0/0.2)]"
            style={{ color: current.unit.color }}
          >
            ▶ {isNew ? t.startButton : t.continue}
          </span>
        </Link>
      )}
      {isNew && <HowItWorks />}
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

/** La ruta completa, agrupada por etapas en el orden recomendado. Usar dentro de <Suspense>. */
export async function StagesSection() {
  const { completed, lastLessonId } = await getLessonProgress();
  const currentUnitId = getContinueLesson(completed, lastLessonId)?.unit.id;

  return (
    <section className="flex flex-col gap-8" aria-labelledby="topics-title">
      <div>
        <h2 id="topics-title" className="text-2xl font-extrabold lg:text-3xl">
          📚 {t.topicsTitle}
        </h2>
        <p className="text-muted">{t.topicsHint}</p>
      </div>
      {getStages().map(({ stage, items }) => {
        const withContent = items.filter((i) => i.unit);
        const doneUnits = withContent.filter((i) => i.unit?.lessons.every((l) => completed.has(l.id))).length;
        return (
          <section key={stage.id} className="flex flex-col gap-4" aria-labelledby={`stage-${stage.id}`}>
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-3xl shadow-[0_3px_0_0_var(--border)]" aria-hidden="true">
                {stage.icon}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 id={`stage-${stage.id}`} className="text-xl font-extrabold leading-tight">
                  {t.stageLabel(stage.id)} · {stage.title}
                </h3>
                <p className="text-muted">{stage.description}</p>
              </div>
              {withContent.length > 0 && (
                <span className="hidden shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-bold text-muted sm:block">
                  {t.unitsDone(doneUnits, items.length)}
                </span>
              )}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map(({ entry, unit }) => (
                <li key={entry.order}>
                  {unit ? (
                    <UnitCard
                      unit={unit}
                      done={unit.lessons.filter((l) => completed.has(l.id)).length}
                      current={unit.id === currentUnitId}
                    />
                  ) : (
                    <UpcomingCard entry={entry} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

function UnitCard({ unit, done, current }: { unit: Unit; done: number; current: boolean }) {
  const total = unit.lessons.length;
  const complete = done === total;
  return (
    <Link
      href={`/unit/${unit.id}`}
      className={cn(
        "flex h-full flex-col gap-3 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.28)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none",
        current && "ring-4 ring-offset-4 ring-offset-background",
      )}
      style={{ backgroundColor: unit.color, ["--tw-ring-color" as string]: unit.color }}
    >
      <span className="flex items-start gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-4xl" aria-hidden="true">
          {unit.icon}
        </span>
        <span className="flex flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-wide opacity-90">
            {t.unitLabel(unit.order)}
            {complete ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-success normal-case">✓ {t.unitDone}</span>
            ) : current ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs normal-case" style={{ color: unit.color }}>
                📍 {t.unitCurrent}
              </span>
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

function UpcomingCard({ entry }: { entry: RoadmapEntry }) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-3xl border-2 border-dashed border-border p-5 opacity-80">
      <span className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-border text-4xl grayscale" aria-hidden="true">
          {entry.icon}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">
            {t.unitLabel(entry.order)} · {t.upcoming}
          </span>
          <span className="text-xl font-extrabold leading-tight">{entry.title}</span>
        </span>
      </span>
      <span className="text-sm text-muted">{entry.goal}</span>
    </div>
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
    <ol className="flex flex-col items-center gap-8 py-4">
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
