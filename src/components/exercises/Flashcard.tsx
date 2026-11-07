"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { Button } from "@/components/ui/Button";
import { Visual } from "@/components/ui/Visual";
import { UI_STRINGS } from "@/lib/config";
import type { ExerciseProps } from "./types";

const t = UI_STRINGS.lesson;

/** Tarjeta de vocabulario que se voltea: inglés (con imagen y "suena como") al frente, español atrás. */
export function Flashcard({ exercise, retry, onAnswer }: ExerciseProps<"flashcard">) {
  const [flipped, setFlipped] = useState(false);
  const audio = exercise.say ?? exercise.en;
  useAutoPlay(audio);
  const hasVisual = Boolean(exercise.color || exercise.symbol || exercise.emoji);

  return (
    <div className="flex flex-col gap-5">
      <ExerciseTitle retry={retry}>{t.instructions.flashcard}</ExerciseTitle>

      <div className="mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-80 w-full"
          aria-label={flipped ? `${exercise.es}. ${t.tapToFlipBack}` : `${exercise.en}. ${t.tapToFlip}`}
        >
          <span
            aria-hidden="true"
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border bg-surface p-6 shadow-[0_6px_0_0_var(--border)]"
          >
            {hasVisual && (
              <span className="flex items-center gap-4">
                {exercise.color && <Visual visual={{ color: exercise.color }} size="lg" />}
                {exercise.symbol && <Visual visual={{ symbol: exercise.symbol }} size="xl" className="text-primary" />}
                {exercise.emoji && <Visual visual={{ emoji: exercise.emoji }} size="xl" />}
              </span>
            )}
            <span lang="en" className="text-center text-4xl font-extrabold">
              {exercise.en}
            </span>
            {exercise.hint && (
              <span className="rounded-full bg-[#fff4d6] px-4 py-1 text-lg font-bold text-[#8a5a00] dark:bg-[#3a3012] dark:text-[#f5c542]">
                🗣️ {t.soundsLike} «{exercise.hint}»
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_6px_0_0_rgb(0_0_0/0.2)]"
          >
            {exercise.color && <Visual visual={{ color: exercise.color }} size="md" />}
            <span className="text-center text-4xl font-extrabold">{exercise.es}</span>
            <span lang="en" className="text-xl opacity-85">
              {exercise.en}
            </span>
          </span>
        </motion.button>
      </div>

      <p className="text-center text-muted">{flipped ? t.tapToFlipBack : t.tapToFlip}</p>
      <ListenControls text={audio} />

      <ActionBar>
        <Button onClick={() => onAnswer({ isCorrect: true, feedback: null })}>{UI_STRINGS.continue}</Button>
      </ActionBar>
    </div>
  );
}
