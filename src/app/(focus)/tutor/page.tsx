import { Suspense } from "react";
import { TutorChat } from "@/components/tutor/TutorChat";
import { requireOnboardedProfile } from "@/lib/auth/session";

/** Tutor IA (Fase 5): conversación libre con Anna. Pantalla completa, sin barra de navegación. */
export default function TutorPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-72 w-full max-w-[720px] animate-pulse rounded-3xl bg-border" />}>
      <TutorGate />
    </Suspense>
  );
}

async function TutorGate() {
  const profile = await requireOnboardedProfile();
  return <TutorChat enabled={Boolean(process.env.ANTHROPIC_API_KEY)} voiceRate={Number(profile.voice_rate)} />;
}
