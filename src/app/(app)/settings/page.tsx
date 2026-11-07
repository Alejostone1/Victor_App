import { Suspense } from "react";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { buttonClasses } from "@/components/ui/Button";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { INTERNAL_EMAIL_DOMAIN } from "@/lib/auth/username";
import { UI_STRINGS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const t = UI_STRINGS.settings;

export default function SettingsPage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold">⚙️ {t.title}</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <SettingsContent />
      </Suspense>
    </section>
  );
}

async function SettingsContent() {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "";
  const username = email.endsWith(`@${INTERNAL_EMAIL_DOMAIN}`) ? email.slice(0, -INTERNAL_EMAIL_DOMAIN.length - 1) : email;

  return (
    <>
      <SettingsForm
        displayName={profile.display_name}
        dailyGoalMinutes={profile.daily_goal_minutes}
        voiceRate={Number(profile.voice_rate)}
      />
      <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5" aria-labelledby="install-settings">
        <h2 id="install-settings" className="text-xl font-extrabold">
          📲 {UI_STRINGS.install.settingsTitle}
        </h2>
        <InstallAppCard variant="settings" />
      </section>
      <form action={signOut} className="flex flex-col items-center gap-2 pt-2">
        {username && <p className="text-muted">👤 {t.account(username)}</p>}
        <button type="submit" className={buttonClasses("secondary")}>
          🚪 {UI_STRINGS.signOut}
        </button>
      </form>
    </>
  );
}
