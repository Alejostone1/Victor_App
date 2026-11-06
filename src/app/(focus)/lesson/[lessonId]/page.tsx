import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { getAllLessons, getLessonRef, isLessonUnlocked } from "@/lib/content/loader";
import { getLessonProgress } from "@/lib/progress";

// El contenido se conoce al compilar: las rutas de lección se prerenderizan.
export function generateStaticParams() {
  return getAllLessons().map(({ lesson }) => ({ lessonId: lesson.id }));
}

export default function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  // params se lee dentro de Suspense para que la navegación sea instantánea.
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonGate params={params} />
    </Suspense>
  );
}

/** Revisa sesión y que la lección esté desbloqueada antes de mostrarla. */
async function LessonGate({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  const ref = getLessonRef(lessonId);
  if (!ref) notFound();
  const profile = await requireOnboardedProfile();
  const { completed } = await getLessonProgress();
  if (!isLessonUnlocked(lessonId, completed)) redirect("/");

  return <LessonPlayer lesson={ref.lesson} unitTitle={ref.unit.title} voiceRate={profile.voice_rate} />;
}

function LessonSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4" aria-hidden="true">
      <div className="h-5 animate-pulse rounded-full bg-border" />
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-border" />
      <div className="h-72 animate-pulse rounded-3xl bg-border" />
    </div>
  );
}
