"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { Button, buttonClasses } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { saveLessonResult, type LessonResultOutput } from "@/lib/lesson/actions";
import type { AnswerRecord } from "@/lib/lesson/summary";
import { playComplete } from "@/lib/sound";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.lesson.complete;
type Saved = Extract<LessonResultOutput, { ok: true }>;
type SaveState = { kind: "saving" } | { kind: "saved"; result: Saved; seconds: number } | { kind: "error" };

type Props = {
  lessonId: string;
  unitTitle: string;
  answers: readonly AnswerRecord[];
  startedAt: number;
  onRestart: () => void;
};

/** Fecha local YYYY-MM-DD (para la actividad del día). */
function localDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** Guarda el resultado y celebra: XP, aciertos, tiempo. */
export function LessonComplete({ lessonId, unitTitle, answers, startedAt, onRestart }: Props) {
  const [state, setState] = useState<SaveState>({ kind: "saving" });
  const started = useRef(false);

  async function runSave() {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    const payload = { lessonId, durationSeconds: seconds, localDate: localDate(), answers: [...answers] };
    let result = await saveLessonResult(payload).catch(() => ({ ok: false }) as const);
    // Un reintento automático antes de molestar al usuario (conexión inestable).
    if (!result.ok) {
      await new Promise((r) => setTimeout(r, 1500));
      result = await saveLessonResult(payload).catch(() => ({ ok: false }) as const);
    }
    if (!result.ok) {
      setState({ kind: "error" });
      return;
    }
    if (result.passed) playComplete();
    setState({ kind: "saved", result, seconds });
  }

  useEffect(() => {
    // Una sola vez, aunque React monte dos veces en desarrollo.
    if (started.current) return;
    started.current = true;
    void runSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "saving") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center" role="status">
        <motion.span
          className="text-6xl"
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        >
          ⭐
        </motion.span>
        <p className="text-xl font-bold">{t.saving}</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
        <span className="text-6xl" aria-hidden="true">
          📶
        </span>
        <p className="text-xl font-bold">{t.saveError}</p>
        <ActionBar>
          <Button
            onClick={() => {
              setState({ kind: "saving" });
              void runSave();
            }}
          >
            {t.retrySave}
          </Button>
          <Link href="/" className={buttonClasses("ghost")}>
            {t.home}
          </Link>
        </ActionBar>
      </div>
    );
  }

  const { result, seconds } = state;
  const { perfect } = result;
  const emoji = !result.passed ? "💪" : perfect ? "🏆" : "🎉";
  const minutes = Math.floor(seconds / 60);
  const time = `${minutes}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex flex-col items-center gap-6 pt-6 text-center">
      {result.passed && <Confetti />}
      <motion.span
        className="text-8xl"
        aria-hidden="true"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 12 }}
      >
        {emoji}
      </motion.span>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          {!result.passed ? t.failedTitle : perfect ? t.perfectTitle : t.title}
        </h2>
        {!result.passed && <p className="mt-2 text-lg text-muted">{UI_STRINGS.checkpointFailed}</p>}
        {result.unitCompleted && (
          <p className="mt-2 text-lg font-bold text-success">🥇 {t.unitDone(unitTitle)}</p>
        )}
      </motion.div>

      <div className="grid w-full grid-cols-3 gap-3">
        <Stat delay={0.35} label={t.xp} value={`+${result.xp}`} icon="⭐" tone="bg-[#fff4d6] border-[#f5c542] dark:bg-[#3a3012]" />
        <Stat
          delay={0.5}
          label={t.accuracy}
          value={result.graded === 0 ? "—" : `${result.percent}%`}
          icon="🎯"
          tone={
            result.graded === 0
              ? "bg-surface border-border"
              : result.percent >= 70
                ? "bg-success-soft border-success"
                : "bg-error-soft border-error"
          }
        />
        <Stat delay={0.65} label={t.time} value={time} icon="⏱️" tone="bg-primary/10 border-primary" />
      </div>

      <ActionBar>
        {result.passed ? (
          <Link href="/" className={buttonClasses("success")}>
            {UI_STRINGS.continue}
          </Link>
        ) : (
          <>
            <Button onClick={onRestart}>{t.retryLesson}</Button>
            <Link href="/" className={buttonClasses("ghost")}>
              {t.home}
            </Link>
          </>
        )}
      </ActionBar>
    </div>
  );
}

function Stat({ label, value, icon, tone, delay }: { label: string; value: string; icon: string; tone: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4", tone)}
    >
      <span className="text-sm font-bold uppercase tracking-wide text-muted">{label}</span>
      <span className="flex items-center gap-1 text-2xl font-extrabold sm:text-3xl">
        <span aria-hidden="true">{icon}</span>
        {value}
      </span>
    </motion.div>
  );
}

const CONFETTI = ["🎉", "⭐", "✨", "🎊", "💛", "⭐", "✨", "🎉", "💙", "⭐"];

/** Lluvia corta de emojis (posiciones fijas, sin aleatoriedad en el render). */
function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-4 h-80 overflow-hidden">
      {CONFETTI.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${5 + ((i * 37) % 90)}%` }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: 260 + (i % 3) * 30, opacity: [0, 1, 1, 0], rotate: (i % 2 ? 1 : -1) * 180 }}
          transition={{ duration: 2.2 + (i % 4) * 0.3, delay: 0.1 * i, ease: "easeOut" }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
