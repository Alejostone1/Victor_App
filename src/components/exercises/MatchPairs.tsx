"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import { OptionCard, type OptionState } from "@/components/lesson/OptionCard";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { speak } from "@/lib/speech/tts";
import { playCorrect, playWrong } from "@/lib/sound";
import { seededShuffle } from "@/lib/utils";
import type { ExerciseProps } from "./types";

type Item = { id: number; text: string };

/** Une cada frase en inglés con su significado. Tocar el inglés lo pronuncia. */
export function MatchPairs({ exercise, seed, retry, onAnswer }: ExerciseProps<"match_pairs">) {
  const left = useMemo<Item[]>(
    () => seededShuffle(exercise.pairs.map(([en], id) => ({ id, text: en })), `${seed}-en`),
    [exercise.pairs, seed],
  );
  const right = useMemo<Item[]>(
    () => seededShuffle(exercise.pairs.map(([, es], id) => ({ id, text: es })), `${seed}-es`),
    [exercise.pairs, seed],
  );
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [selRight, setSelRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matched.length === exercise.pairs.length;

  function tryMatch(l: number, r: number) {
    setSelLeft(null);
    setSelRight(null);
    if (l === r) {
      setMatched((m) => [...m, l]);
      playCorrect();
    } else {
      setWrong({ left: l, right: r });
      setMistakes((n) => n + 1);
      playWrong();
      setTimeout(() => setWrong(null), 650);
    }
  }

  function pickLeft(item: Item) {
    void speak(item.text);
    if (selRight !== null) tryMatch(item.id, selRight);
    else setSelLeft(selLeft === item.id ? null : item.id);
  }

  function pickRight(item: Item) {
    if (selLeft !== null) tryMatch(selLeft, item.id);
    else setSelRight(selRight === item.id ? null : item.id);
  }

  function stateOf(id: number, side: "left" | "right"): OptionState {
    if (matched.includes(id)) return "correct";
    if (wrong && wrong[side] === id) return "wrong";
    return (side === "left" ? selLeft : selRight) === id ? "selected" : "idle";
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{UI_STRINGS.lesson.instructions.match_pairs}</ExerciseTitle>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {left.map((item) => (
            <OptionCard
              key={item.id}
              lang="en"
              state={stateOf(item.id, "left")}
              disabled={matched.includes(item.id)}
              onClick={() => pickLeft(item)}
              className="min-h-20 justify-center text-center text-lg"
            >
              {item.text}
            </OptionCard>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {right.map((item) => (
            <OptionCard
              key={item.id}
              state={stateOf(item.id, "right")}
              disabled={matched.includes(item.id)}
              onClick={() => pickRight(item)}
              className="min-h-20 justify-center text-center text-lg"
            >
              {item.text}
            </OptionCard>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-2xl font-extrabold text-success"
            role="status"
          >
            🎉 {UI_STRINGS.lesson.matchDone}
          </motion.p>
        )}
      </AnimatePresence>

      {done && (
        <ActionBar>
          <Button
            variant="success"
            onClick={() =>
              onAnswer({
                isCorrect: mistakes === 0,
                userAnswer: `${mistakes} errores`,
                feedback: null,
              })
            }
          >
            {UI_STRINGS.continue}
          </Button>
        </ActionBar>
      )}
    </div>
  );
}
