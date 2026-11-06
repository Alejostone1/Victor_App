"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { completeOnboarding } from "@/lib/auth/actions";
import { DAILY_GOAL_OPTIONS, DEFAULT_DAILY_GOAL_MINUTES, UI_STRINGS } from "@/lib/config";
import { AudioCheck } from "./AudioCheck";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.onboarding;
const TOTAL_STEPS = 3;
type DailyGoal = (typeof DAILY_GOAL_OPTIONS)[number];

export function OnboardingFlow({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName);
  const [goal, setGoal] = useState<DailyGoal>(DEFAULT_DAILY_GOAL_MINUTES);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  const canContinue = step !== 1 || name.trim().length > 0;

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({ displayName: name, dailyGoalMinutes: goal });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-center font-bold text-muted">{t.stepOf(step, TOTAL_STEPS)}</p>
        <div className="flex gap-2" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn("h-2 flex-1 rounded-full", i < step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={step}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-surface p-6"
        >
          {step === 1 && (
            <>
              <h1 className="text-3xl font-extrabold">{t.nameTitle}</h1>
              <p className="text-muted">{t.nameHint}</p>
              <input
                aria-label={t.nameTitle}
                autoComplete="name"
                maxLength={40}
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-touch rounded-2xl border-2 border-border bg-background px-4 py-3 text-xl outline-none focus:border-primary"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-3xl font-extrabold">{t.goalTitle}</h1>
              <p className="text-muted">{t.goalHint}</p>
              <div role="radiogroup" aria-label={t.goalTitle} className="grid grid-cols-2 gap-3">
                {DAILY_GOAL_OPTIONS.map((minutes) => {
                  const selected = goal === minutes;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setGoal(minutes)}
                      className={cn(
                        "flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-3 transition",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary",
                      )}
                    >
                      <span className="text-2xl font-extrabold">{t.minutes(minutes)}</span>
                      <span className="font-semibold">{t.goalLabels[minutes]}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && <AudioCheck />}
        </motion.section>
      </AnimatePresence>

      {error && (
        <p role="alert" className="rounded-xl bg-error-soft p-3 font-semibold">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>
            {t.next}
          </Button>
        ) : (
          <Button onClick={finish} disabled={isPending}>
            {isPending ? t.saving : t.finish}
          </Button>
        )}
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={isPending}>
            {t.back}
          </Button>
        )}
      </div>
    </div>
  );
}
