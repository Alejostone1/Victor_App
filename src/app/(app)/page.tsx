import { Suspense } from "react";
import { requireOnboardedProfile } from "@/lib/auth/session";

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6">
      <Suspense fallback={<div className="h-24 animate-pulse rounded-3xl bg-border" />}>
        <Greeting />
      </Suspense>
      <div className="rounded-3xl border-2 border-dashed border-border p-6 text-muted">
        Aquí aparecerá tu camino de unidades (Fase 2).
      </div>
    </section>
  );
}

async function Greeting() {
  const profile = await requireOnboardedProfile();
  return (
    <header className="flex flex-col gap-1 rounded-3xl bg-primary p-6 text-primary-foreground">
      <p className="text-lg font-semibold">Hello! 👋</p>
      <h1 className="text-3xl font-extrabold">¡Hola, {profile.display_name}!</h1>
      <p>Tu meta de hoy: {profile.daily_goal_minutes} minutos.</p>
    </header>
  );
}
