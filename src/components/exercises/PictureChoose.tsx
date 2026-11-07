"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { OptionCard, type OptionState } from "@/components/lesson/OptionCard";
import { Button } from "@/components/ui/Button";
import { Visual } from "@/components/ui/Visual";
import { UI_STRINGS } from "@/lib/config";
import { gradeChoice } from "@/lib/grading";
import { speak } from "@/lib/speech/tts";
import { seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

/** Mira la imagen y elige la palabra en inglés. Al tocar una opción, suena. */
export function PictureChoose({ exercise, seed, retry, locked, onAnswer }: ExerciseProps<"picture_choose">) {
  const options = useMemo(() => seededShuffle(exercise.options, seed), [exercise.options, seed]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function choose(option: string) {
    setSelected(option);
    void speak(option);
  }

  function check() {
    if (!selected) return;
    setChecked(true);
    const result = gradeChoice(selected, exercise.answer);
    onAnswer({
      isCorrect: result === "correct",
      userAnswer: selected,
      feedback: { result, correctAnswer: exercise.answer, audio: exercise.answer },
    });
  }

  function stateOf(option: string): OptionState {
    if (!checked) return selected === option ? "selected" : "idle";
    if (option === exercise.answer) return "correct";
    return option === selected ? "wrong" : "dim";
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{exercise.question ?? UI_STRINGS.lesson.instructions.picture_choose}</ExerciseTitle>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="mx-auto flex min-h-44 w-full max-w-xs items-center justify-center gap-3 rounded-3xl border-2 border-border bg-surface p-6 shadow-[0_6px_0_0_var(--border)]"
      >
        <Visual visual={exercise.visual} size="xl" className={exercise.visual.symbol ? "text-primary" : undefined} />
      </motion.div>
      <div className="flex flex-col gap-3" role="radiogroup">
        {options.map((option) => (
          <OptionCard
            key={option}
            lang="en"
            state={stateOf(option)}
            disabled={checked || locked}
            onClick={() => choose(option)}
          >
            <span aria-hidden="true" className="text-2xl">
              🔊
            </span>
            {option}
          </OptionCard>
        ))}
      </div>
      {!checked && (
        <ActionBar>
          <Button onClick={check} disabled={!selected}>
            {UI_STRINGS.check}
          </Button>
        </ActionBar>
      )}
    </div>
  );
}
