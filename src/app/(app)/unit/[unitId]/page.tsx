import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnitLessonPath } from "@/components/path/UnitPath";
import { WordChips } from "@/components/path/WordChips";
import { UI_STRINGS } from "@/lib/config";
import { getUnit, getUnits } from "@/lib/content/loader";

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

  const seen = new Set<string>();
  const words = unit.lessons
    .flatMap((l) => l.vocab ?? [])
    .filter((w) => (seen.has(w.key) ? false : (seen.add(w.key), true)));

  return (
    <>
      <header
        className="flex items-center gap-4 rounded-3xl p-5 text-white shadow-[0_6px_0_0_rgb(0_0_0/0.28)]"
        style={{ backgroundColor: unit.color }}
      >
        <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-5xl" aria-hidden="true">
          {unit.icon}
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide opacity-85">{t.unitLabel(unit.order)}</p>
          <h1 className="text-3xl font-extrabold leading-tight">{unit.title}</h1>
          <p lang="en" className="opacity-85">
            {unit.titleEn}
          </p>
          {unit.description && <p className="mt-1 opacity-90">{unit.description}</p>}
        </div>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <UnitLessonPath unit={unit} />
      </Suspense>

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
    </>
  );
}
