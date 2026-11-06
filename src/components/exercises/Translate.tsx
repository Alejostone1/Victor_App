"use client";

import { useState, type FormEvent } from "react";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { gradeText, normalize, prettySentence } from "@/lib/grading";
import type { ExerciseProps } from "./types";

/** Traduce una frase corta del español al inglés. */
export function Translate({ exercise, retry, locked, onAnswer }: ExerciseProps<"translate">) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  // Para mostrar, se prefiere la versión con puntuación ("And you?") si existe.
  const display = prettySentence(
    exercise.accept?.find((a) => normalize(a) === normalize(exercise.answer)) ?? exercise.answer,
  );

  function check(event?: FormEvent) {
    event?.preventDefault();
    if (!value.trim() || checked) return;
    setChecked(true);
    const result = gradeText(value, exercise.answer, exercise.accept);
    onAnswer({
      isCorrect: result !== "wrong",
      userAnswer: value.trim(),
      feedback: { result, correctAnswer: display, audio: display },
    });
  }

  return (
    <form onSubmit={check} className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.translate}</ExerciseTitle>

      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-surface px-4 py-8">
        <p className="text-lg text-muted">{UI_STRINGS.lesson.translatePrompt}</p>
        <p className="text-center text-4xl font-extrabold">{exercise.es}</p>
      </div>

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
        aria-label={UI_STRINGS.lesson.instructions.translate}
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
