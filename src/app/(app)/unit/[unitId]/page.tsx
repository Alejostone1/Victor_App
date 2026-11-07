import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnitLessonPath } from "@/components/path/UnitPath";
import { WordChips } from "@/components/path/WordChips";
import { UI_STRINGS } from "@/lib/config";
import { getStageOf, getUnit, getUnits } from "@/lib/content/loader";

const t = UI_STRINGS.path;

export function generateStaticParams() {
  return getUnits().map((unit) => ({ unitId: unit.id }));
}

export default function UnitPage({ params }: PageProps<"/unit/[unitId]">) {
  // params se lee dentro de Suspense para que la navegación sea instantánea.
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6 lg:max-w-6xl lg:p-8">
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

  const stage = getStageOf(unit);
  const units = getUnits();
  const next = units[units.findIndex((u) => u.id === unit.id) + 1];
  const seen = new Set<string>();
  const words = unit.lessons
    .flatMap((l) => l.vocab ?? [])
    .filter((w) => (seen.has(w.key) ? false : (seen.add(w.key), true)));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-10">
      {/* Columna de información: en PC queda fija mientras se recorre el camino. */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-8">
        <header
          className="flex items-center gap-4 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.28)]"
          style={{ backgroundColor: unit.color }}
        >
          <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-5xl" aria-hidden="true">
            {unit.icon}
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide opacity-85">
              {stage ? `${t.stageLabel(stage.id)} · ${stage.title} · ` : ""}
              {t.unitLabel(unit.order)}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight">{unit.title}</h1>
            <p lang="en" className="opacity-85">
              {unit.titleEn}
            </p>
          </div>
        </header>

        {unit.canDo && unit.canDo.length > 0 && (
          <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="cando-title">
            <h2 id="cando-title" className="text-xl font-extrabold">
              🎯 {t.canDoTitle}
            </h2>
            <ul className="flex flex-col gap-2">
              {unit.canDo.map((goal) => (
                <li key={goal} className="flex items-start gap-3 text-lg">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: unit.color }}>
                    ✓
                  </span>
                  {goal}
                </li>
              ))}
            </ul>
          </section>
        )}

        {words.length > 0 && (
          <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="words-title">
            <div>
              <h2 id="words-title" className="text-xl font-extrabold">
                {t.wordsTitle}
              </h2>
              <p className="text-muted">{t.wordsHint}</p>
            </div>
            <WordChips words={words} color={unit.color} />
          </section>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
          <UnitLessonPath unit={unit} />
        </Suspense>
        {next && (
          <Link
            href={`/unit/${next.id}`}
            className="flex items-center gap-4 rounded-3xl border-2 border-dashed p-4 transition-colors hover:bg-surface"
            style={{ borderColor: next.color }}
          >
            <span className="text-4xl" aria-hidden="true">
              {next.icon}
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-bold uppercase tracking-wide text-muted">{t.nextUnit}</span>
              <span className="text-xl font-extrabold">{next.title}</span>
            </span>
            <span className="text-2xl" aria-hidden="true">
              ➜
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
