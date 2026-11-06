import { Suspense } from "react";
import { NavBar } from "@/components/ui/NavBar";
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

/** Envía al onboarding si el usuario aún no lo completó. No pinta nada. */
async function OnboardingGate() {
  await requireOnboardedProfile();
  return null;
}
