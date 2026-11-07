"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import {
  dismissInstall,
  getInstallState,
  getServerInstallState,
  isInstallDismissed,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwa";

const t = UI_STRINGS.install;

/**
 * "home": tarjeta en el inicio, solo si se puede instalar y no la cerró hace poco.
 * "settings": siempre visible, con el estado y los pasos según el teléfono.
 */
export function InstallAppCard({ variant }: { variant: "home" | "settings" }) {
  const state = useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  const dismissed = useSyncExternalStore(subscribeInstall, isInstallDismissed, () => true);
  const [busy, setBusy] = useState(false);

  async function install() {
    setBusy(true);
    await promptInstall();
    setBusy(false);
  }

  if (variant === "home") {
    if (dismissed || (state !== "available" && state !== "ios")) return null;
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 rounded-3xl border-2 border-primary bg-primary/5 p-4"
        aria-labelledby="install-title"
      >
        <div className="flex items-center gap-3">
          <span className="text-5xl" aria-hidden="true">
            📲
          </span>
          <div className="flex flex-col">
            <h2 id="install-title" className="text-xl font-extrabold leading-tight">
              {t.homeTitle}
            </h2>
            <p className="text-muted">{t.homeBody}</p>
          </div>
        </div>
        {state === "available" ? (
          <Button onClick={install} disabled={busy}>
            {t.installButton}
          </Button>
        ) : (
          <IosSteps />
        )}
        <button type="button" onClick={dismissInstall} className="self-center text-base font-bold text-muted underline-offset-4 hover:underline">
          {t.notNow}
        </button>
      </motion.section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "installed" && <p className="rounded-2xl bg-success-soft p-4 text-lg font-bold">✅ {t.installed}</p>}
      {state === "available" && (
        <>
          <p className="text-muted">{t.homeBody}</p>
          <Button onClick={install} disabled={busy}>
            {t.installButton}
          </Button>
        </>
      )}
      {state === "ios" && <IosSteps />}
      {(state === "android" || state === "unsupported") && <AndroidSteps />}
    </div>
  );
}

function Steps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5 text-lg">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function IosSteps() {
  return <Steps steps={t.iosSteps} />;
}

function AndroidSteps() {
  return <Steps steps={t.androidSteps} />;
}
