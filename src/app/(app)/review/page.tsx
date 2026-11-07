import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { LEARNING_RULES, UI_STRINGS } from "@/lib/config";
import { daysBetween, localDate } from "@/lib/dates";
import { getReviewCounts } from "@/lib/gamification/server";

const t = UI_STRINGS.review;

export default function ReviewPage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold">🔁 {t.title}</h1>
        <p className="text-lg text-muted">{t.subtitle}</p>
      </header>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-border" />}>
        <ReviewOverview />
      </Suspense>
    </section>
  );
}

function whenLabel(nextAt: string | null): string {
  if (!nextAt) return t.tomorrow;
  const days = daysBetween(localDate(), localDate(new Date(nextAt)));
  if (days <= 0) return t.today;
  return days === 1 ? t.tomorrow : t.inDays(days);
}

async function ReviewOverview() {
  const { due, total, nextAt } = await getReviewCounts();

  if (total === 0) {
    return (
      <Card icon="🌱" title={t.emptyTitle} body={t.emptyBody}>
        <Link href="/" className={buttonClasses("primary")}>
          📚 Ir a mis lecciones
        </Link>
      </Card>
    );
  }

  if (due === 0) {
    return (
      <Card icon="🎉" title={t.doneTitle} body={t.doneBody(whenLabel(nextAt))} footer={t.totalWords(total)}>
        <Link href="/review/session" className={buttonClasses("secondary")}>
          {t.practiceAnyway}
        </Link>
      </Card>
    );
  }

  return (
    <Card icon="🧠" title={t.dueCount(due)} body={UI_STRINGS.home.reviewHint} footer={t.totalWords(total)}>
      <Link href="/review/session" className={buttonClasses("success")}>
        ▶ {t.start(Math.min(due, LEARNING_RULES.reviewSessionMaxItems))}
      </Link>
    </Card>
  );
}

function Card({
  icon,
  title,
  body,
  footer,
  children,
}: {
  icon: string;
  title: string;
  body: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-border bg-surface p-6 text-center">
      <span className="text-7xl" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="text-lg text-muted">{body}</p>
      <div className="flex w-full max-w-sm flex-col gap-3">{children}</div>
      {footer && <p className="text-sm font-bold text-muted">📚 {footer}</p>}
    </div>
  );
}
