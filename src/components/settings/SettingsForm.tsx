"use client";

import { useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AudioCheck } from "@/components/onboarding/AudioCheck";
import { Button } from "@/components/ui/Button";
import { DAILY_GOAL_OPTIONS, UI_STRINGS, VOICE_RATE_OPTIONS } from "@/lib/config";
import { updateSettings } from "@/lib/settings/actions";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sound";
import { setVoiceRate, speak } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.settings;

type Props = { displayName: string; dailyGoalMinutes: number; voiceRate: number };

export function SettingsForm({ displayName, dailyGoalMinutes, voiceRate }: Props) {
  const [name, setName] = useState(displayName);
  const [goal, setGoal] = useState(dailyGoalMinutes);
  const [rate, setRate] = useState(
    VOICE_RATE_OPTIONS.reduce((best, o) => (Math.abs(o.value - voiceRate) < Math.abs(best - voiceRate) ? o.value : best), 0.9 as number),
  );
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  const [status, setStatus] = useState<{ kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string }>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function testVoice(value: number) {
    setRate(value);
    setVoiceRate(value);
    void speak(t.voiceSample);
  }

  function save() {
    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result = await updateSettings({ displayName: name, dailyGoalMinutes: goal, voiceRate: rate });
      setStatus(result.ok ? { kind: "saved" } : { kind: "error", message: result.error });
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title={`🙂 ${t.nameLabel}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          aria-label={t.nameLabel}
          className="min-h-touch w-full rounded-2xl border-2 border-border bg-background px-4 text-xl font-bold focus:border-primary"
        />
      </Section>

      <Section title={`🎯 ${t.goalLabel}`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={t.goalLabel}>
          {DAILY_GOAL_OPTIONS.map((minutes) => (
            <Choice key={minutes} active={goal === minutes} onClick={() => setGoal(minutes)}>
              <span className="text-xl font-extrabold">{UI_STRINGS.onboarding.minutes(minutes)}</span>
              <span className="text-sm text-muted">{UI_STRINGS.onboarding.goalLabels[minutes]}</span>
            </Choice>
          ))}
        </div>
      </Section>

      <Section title={`🔊 ${t.voiceLabel}`} hint="Toca una opción para escucharla.">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.voiceLabel}>
          {VOICE_RATE_OPTIONS.map((option) => (
            <Choice key={option.value} active={rate === option.value} onClick={() => testVoice(option.value)}>
              <span className="text-3xl" aria-hidden="true">
                {option.icon}
              </span>
              <span className="font-extrabold">{option.label}</span>
            </Choice>
          ))}
        </div>
      </Section>

      <Section title={`🔔 ${t.soundLabel}`}>
        <button
          type="button"
          role="switch"
          aria-checked={!muted}
          onClick={() => setMuted(!muted)}
          className="flex min-h-touch items-center justify-between gap-3 rounded-2xl border-2 border-border bg-background px-4 py-2"
        >
          <span className="text-lg font-bold">{muted ? `🔕 ${t.soundOff}` : `🔔 ${t.soundOn}`}</span>
          <span className={cn("relative h-8 w-14 rounded-full transition-colors", muted ? "bg-border" : "bg-success")}>
            <motion.span
              className="absolute top-1 size-6 rounded-full bg-white shadow"
              animate={{ left: muted ? 4 : 28 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </span>
        </button>
      </Section>

      <Section title={`🎤 ${t.micLabel}`}>
        <AudioCheck />
      </Section>

      <div className="flex flex-col gap-2">
        <Button onClick={save} disabled={pending || name.trim().length === 0}>
          {pending ? t.saving : `💾 ${t.save}`}
        </Button>
        {status.kind === "saved" && (
          <p className="text-center font-bold text-success" role="status">
            ✅ {t.saved}
          </p>
        )}
        {status.kind === "error" && (
          <p className="text-center font-bold text-error" role="alert">
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-surface p-5">
      <div>
        <h2 className="text-xl font-extrabold">{title}</h2>
        {hint && <p className="text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex min-h-touch flex-col items-center justify-center gap-0.5 rounded-2xl border-2 p-3 transition-colors",
        active ? "border-primary bg-primary/10 shadow-[0_4px_0_0_var(--primary)]" : "border-border bg-background hover:border-primary",
      )}
    >
      {children}
    </button>
  );
}
