import { Suspense } from "react";
import { requireOnboardedProfile } from "@/lib/auth/session";

// TODO(Fase 2): barra inferior en móvil y barra lateral en PC (>= 1024px).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      {/* La sesión se lee dentro de Suspense para no bloquear el resto (Cache Components). */}
      <Suspense fallback={null}>
        <OnboardingGate />
      </Suspense>
      {children}
    </main>
  );
}

/** Envía al onboarding si el usuario aún no lo completó. No pinta nada. */
async function OnboardingGate() {
  await requireOnboardedProfile();
  return null;
}
