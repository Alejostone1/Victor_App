"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import type { OptionState } from "@/components/lesson/OptionCard";
import { Button } from "@/components/ui/Button";
import { Visual } from "@/components/ui/Visual";
import { UI_STRINGS } from "@/lib/config";
import { gradeChoice } from "@/lib/grading";
import { cn, seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

const TILE: Record<OptionState, string> = {
  idle: "border-border bg-surface hover:border-primary",
  selected: "border-primary bg-primary/10 shadow-[0_5px_0_0_var(--primary)] -translate-y-1",
  correct: "border-success bg-success-soft",
  wrong: "border-error bg-error-soft",
  dim: "border-border bg-surface opacity-40",
};

/** Escucha y toca el color, la letra, el número o la imagen correcta. */
export function TapChoose({ exercise, seed, retry, locked, onAnswer }: ExerciseProps<"tap_choose">) {
  const options = useMemo(() => seededShuffle(exercise.options, seed), [exercise.options, seed]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  useAutoPlay(exercise.audio);

  function check() {
    if (!selected) return;
    setChecked(true);
    const result = gradeChoice(selected, exercise.answer);
    onAnswer({
      isCorrect: result === "correct",
      userAnswer: selected,
      feedback: { result, correctAnswer: exercise.word, audio: exercise.audio },
    });
  }

  function stateOf(value: string): OptionState {
    if (!checked) return selected === value ? "selected" : "idle";
    if (value === exercise.answer) return "correct";
    return value === selected ? "wrong" : "dim";
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.tap_choose}</ExerciseTitle>
      <ListenControls text={exercise.audio} className="py-2" />
      <div className={cn("grid gap-3", options.length <= 4 ? "grid-cols-2" : "grid-cols-3")} role="radiogroup">
        {options.map((option) => {
          const state = stateOf(option.value);
          return (
            <motion.button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected === option.value}
              aria-label={option.value}
              disabled={checked || locked}
              onClick={() => setSelected(option.value)}
              whileTap={checked ? undefined : { scale: 0.94 }}
              animate={state === "wrong" ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-3xl border-4 p-3 transition-all disabled:cursor-default",
                TILE[state],
              )}
            >
              <Visual visual={option} size={options.length <= 4 ? "lg" : "md"} />
            </motion.button>
          );
        })}
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
