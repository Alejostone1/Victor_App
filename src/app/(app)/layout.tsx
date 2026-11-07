import { Suspense } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { VoiceRateSync } from "@/components/ui/VoiceRateSync";
import { requireOnboardedProfile } from "@/lib/auth/session";

/** Pantallas principales: barra inferior (celular) o lateral (PC) y contenido centrado. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <NavBar />
      </Suspense>
      <main className="flex flex-1 flex-col pb-24 lg:pb-0 lg:pl-64">
        {/* La sesión se lee dentro de Suspense para no bloquear el resto (Cache Components). */}
        <Suspense fallback={null}>
          <OnboardingGate />
        </Suspense>
        {children}
      </main>
    </div>
  );
}

/** Envía al onboarding si el usuario aún no lo completó y aplica su velocidad de voz. */
async function OnboardingGate() {
  const profile = await requireOnboardedProfile();
  return <VoiceRateSync rate={Number(profile.voice_rate)} />;
}
