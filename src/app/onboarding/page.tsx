import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getCurrentProfile } from "@/lib/auth/session";
import { APP_CONFIG } from "@/lib/config";

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 pt-8 sm:items-center">
      <Suspense fallback={<p className="text-muted">Cargando…</p>}>
        <Onboarding />
      </Suspense>
    </main>
  );
}

async function Onboarding() {
  const profile = await getCurrentProfile();
  if (profile.onboarding_completed) redirect("/");

  const initialName =
    profile.display_name === APP_CONFIG.studentDefaultName ? "" : profile.display_name;
  return <OnboardingFlow initialName={initialName} />;
}
