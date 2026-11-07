import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { UI_STRINGS } from "@/lib/config";
import { buildReinforcementLesson, getReinforcementTags } from "@/lib/content/reinforcement";
import { localDate } from "@/lib/dates";
import { getLessonProgress } from "@/lib/progress";

export function generateStaticParams() {
  return getReinforcementTags().map((tag) => ({ tag }));
}

/** Lección de refuerzo: ejercicios del tema donde más se equivocó esta semana. */
export default function PracticePage({ params }: PageProps<"/practice/[tag]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-72 w-full max-w-[720px] animate-pulse rounded-3xl bg-border p-4" />}>
      <PracticeGate params={params} />
    </Suspense>
  );
}

async function PracticeGate({ params }: { params: PageProps<"/practice/[tag]">["params"] }) {
  const { tag } = await params;
  const profile = await requireOnboardedProfile();
  const { completed } = await getLessonProgress();
  // La selección cambia cada día, pero no a mitad de la práctica.
  const lesson = buildReinforcementLesson(tag, completed, localDate());
  if (lesson === null) {
    if (!getReinforcementTags().includes(tag)) notFound();
    redirect("/");
  }
  return <LessonPlayer lesson={lesson} unitTitle={UI_STRINGS.home.reinforceTitle} voiceRate={profile.voice_rate} />;
}
