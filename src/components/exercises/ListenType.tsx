"use client";

import { useState, type FormEvent } from "react";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { gradeText, prettySentence } from "@/lib/grading";
import type { ExerciseProps } from "./types";

/** Dictado: escucha y escribe en inglés. */
export function ListenType({ exercise, retry, locked, onAnswer }: ExerciseProps<"listen_type">) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  useAutoPlay(exercise.audio);

  function check(event?: FormEvent) {
    event?.preventDefault();
    if (!value.trim() || checked) return;
    setChecked(true);
    const result = gradeText(value, exercise.answer, exercise.accept);
    onAnswer({
      isCorrect: result !== "wrong",
      userAnswer: value.trim(),
      feedback: { result, correctAnswer: prettySentence(exercise.audio), audio: exercise.audio },
    });
  }

  return (
    <form onSubmit={check} className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.listen_type}</ExerciseTitle>
      <ListenControls text={exercise.audio} className="py-4" />
      <textarea
        lang="en"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) check(e);
        }}
        readOnly={checked || locked}
        rows={2}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label={UI_STRINGS.lesson.instructions.listen_type}
        placeholder={UI_STRINGS.lesson.typeHere}
        className="w-full resize-none rounded-2xl border-2 border-border bg-surface px-4 py-3 text-2xl outline-none focus:border-primary"
      />
      {!checked && (
        <ActionBar>
          <Button type="submit" disabled={!value.trim()}>
            {UI_STRINGS.check}
          </Button>
        </ActionBar>
      )}
    </form>
  );
}
