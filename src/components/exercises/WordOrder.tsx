"use client";

import { useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { gradeWordOrder, prettySentence } from "@/lib/grading";
import { speak } from "@/lib/speech/tts";
import { playTap } from "@/lib/sound";
import { cn, seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

type Chip = { id: number; word: string };

const chipClasses =
  "min-h-touch rounded-2xl border-2 border-border bg-surface px-4 py-2 text-xl font-bold shadow-[0_3px_0_0_var(--border)]";

/** Ordena las fichas para armar la frase en inglés. */
export function WordOrder({ exercise, seed, retry, locked, onAnswer }: ExerciseProps<"word_order">) {
  const bank = useMemo<Chip[]>(
    () => seededShuffle(exercise.words.map((word, id) => ({ id, word })), seed),
    [exercise.words, seed],
  );
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const disabled = checked || locked;

  function add(chip: Chip) {
    if (disabled) return;
    playTap();
    if (/[a-z]/i.test(chip.word)) void speak(chip.word);
    setChosen((c) => [...c, chip.id]);
  }

  function remove(id: number) {
    if (disabled) return;
    setChosen((c) => c.filter((x) => x !== id));
  }

  function check() {
    setChecked(true);
    const words = chosen.map((id) => exercise.words[id]);
    const result = gradeWordOrder(words, exercise.answer);
    const sentence = prettySentence(exercise.answer);
    onAnswer({
      isCorrect: result === "correct",
      userAnswer: prettySentence(words.join(" ")),
      feedback: { result, correctAnswer: sentence, audio: sentence },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.word_order}</ExerciseTitle>

      <div className="flex items-center gap-3">
        <span className="text-5xl" aria-hidden="true">
          💬
        </span>
        <p className="rounded-2xl rounded-bl-none border-2 border-border bg-surface px-4 py-3 text-2xl font-bold">
          {exercise.es}
        </p>
      </div>

      <LayoutGroup>
        <div
          className="flex min-h-28 flex-wrap content-start gap-2 border-b-2 border-dashed border-border pb-4"
          aria-label={UI_STRINGS.lesson.wordOrderEmpty}
        >
          {chosen.length === 0 && <p className="self-center text-muted">{UI_STRINGS.lesson.wordOrderEmpty}</p>}
          {chosen.map((id) => (
            <motion.button
              layoutId={`chip-${seed}-${id}`}
              key={id}
              type="button"
              lang="en"
              onClick={() => remove(id)}
              disabled={disabled}
              className={cn(chipClasses, "border-primary")}
            >
              {exercise.words[id]}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {bank.map((chip) =>
            chosen.includes(chip.id) ? (
              <span key={chip.id} aria-hidden="true" className={cn(chipClasses, "invisible")}>
                {chip.word}
              </span>
            ) : (
              <motion.button
                layoutId={`chip-${seed}-${chip.id}`}
                key={chip.id}
                type="button"
                lang="en"
                whileTap={{ scale: 0.94 }}
                onClick={() => add(chip)}
                disabled={disabled}
                className={chipClasses}
              >
                {chip.word}
              </motion.button>
            ),
          )}
        </div>
      </LayoutGroup>

      {!checked && (
        <ActionBar>
          <Button onClick={check} disabled={chosen.length === 0}>
            {UI_STRINGS.check}
          </Button>
        </ActionBar>
      )}
    </div>
  );
}
