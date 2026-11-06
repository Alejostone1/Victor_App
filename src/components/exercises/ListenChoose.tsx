"use client";

import { useMemo, useState } from "react";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { OptionCard, type OptionState } from "@/components/lesson/OptionCard";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { gradeChoice } from "@/lib/grading";
import { seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

export function ListenChoose({ exercise, seed, retry, locked, onAnswer }: ExerciseProps<"listen_choose">) {
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
      feedback: { result, correctAnswer: exercise.answer, audio: exercise.audio },
    });
  }

  function stateOf(option: string): OptionState {
    if (!checked) return selected === option ? "selected" : "idle";
    if (option === exercise.answer) return "correct";
    return option === selected ? "wrong" : "dim";
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.listen_choose}</ExerciseTitle>
      <ListenControls text={exercise.audio} className="py-4" />
      <div className="flex flex-col gap-3" role="radiogroup">
        {options.map((option, i) => (
          <OptionCard
            key={option}
            state={stateOf(option)}
            disabled={checked || locked}
            onClick={() => setSelected(option)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-current text-base opacity-60">
              {i + 1}
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
