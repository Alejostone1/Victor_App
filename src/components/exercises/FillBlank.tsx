"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { OptionCard, type OptionState } from "@/components/lesson/OptionCard";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { gradeChoice } from "@/lib/grading";
import { cn, seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

/** Completa el espacio de la frase eligiendo una palabra. */
export function FillBlank({ exercise, seed, retry, locked, onAnswer }: ExerciseProps<"fill_blank">) {
  const options = useMemo(() => seededShuffle(exercise.options, seed), [exercise.options, seed]);
  const [before, after = ""] = exercise.sentence.split("___");
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const result = checked && selected ? gradeChoice(selected, exercise.answer) : null;

  function check() {
    if (!selected) return;
    setChecked(true);
    const grade = gradeChoice(selected, exercise.answer);
    const full = `${before}${exercise.answer}${after}`.trim();
    onAnswer({
      isCorrect: grade === "correct",
      userAnswer: selected,
      feedback: { result: grade, correctAnswer: full, audio: full },
    });
  }

  function stateOf(option: string): OptionState {
    if (!checked) return selected === option ? "selected" : "idle";
    if (option === exercise.answer) return "correct";
    return option === selected ? "wrong" : "dim";
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.fill_blank}</ExerciseTitle>

      <p
        lang="en"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 rounded-3xl border-2 border-border bg-surface px-4 py-8 text-center text-3xl font-extrabold"
      >
        <span>{before.trim()}</span>
        <span
          className={cn(
            "inline-flex min-w-24 items-center justify-center rounded-xl border-b-4 px-3 py-1",
            result === "correct" && "border-success bg-success-soft",
            result === "wrong" && "border-error bg-error-soft",
            !result && (selected ? "border-primary bg-primary/10" : "border-dashed border-muted"),
          )}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={selected ?? "empty"}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {selected ?? " "}
            </motion.span>
          </AnimatePresence>
        </span>
        {after.trim() && <span>{after.trim()}</span>}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <OptionCard
            key={option}
            lang="en"
            state={stateOf(option)}
            disabled={checked || locked}
            onClick={() => setSelected(option)}
            className="justify-center text-center"
          >
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
