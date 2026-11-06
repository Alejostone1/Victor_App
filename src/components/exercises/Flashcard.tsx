"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import type { ExerciseProps } from "./types";

const t = UI_STRINGS.lesson;

/** Tarjeta de vocabulario que se voltea: inglés al frente, español atrás. */
export function Flashcard({ exercise, retry, onAnswer }: ExerciseProps<"flashcard">) {
  const [flipped, setFlipped] = useState(false);
  useAutoPlay(exercise.en);

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{t.instructions.flashcard}</ExerciseTitle>

      <div className="mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-72 w-full"
          aria-label={flipped ? `${exercise.es}. ${t.tapToFlipBack}` : `${exercise.en}. ${t.tapToFlip}`}
        >
          <span
            aria-hidden="true"
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border bg-surface p-6 shadow-[0_6px_0_0_var(--border)]"
          >
            {exercise.emoji && <span className="text-7xl">{exercise.emoji}</span>}
            <span lang="en" className="text-center text-4xl font-extrabold">
              {exercise.en}
            </span>
          </span>
          <span
            aria-hidden="true"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_6px_0_0_rgb(0_0_0/0.2)]"
          >
            <span className="text-center text-4xl font-extrabold">{exercise.es}</span>
            <span lang="en" className="text-xl opacity-85">
              {exercise.en}
            </span>
          </span>
        </motion.button>
      </div>

      <p className="text-center text-muted">{flipped ? t.tapToFlipBack : t.tapToFlip}</p>
      <ListenControls text={exercise.en} />

      <ActionBar>
        <Button onClick={() => onAnswer({ isCorrect: true, feedback: null })}>{UI_STRINGS.continue}</Button>
      </ActionBar>
    </div>
  );
}
