"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech/tts";

type Word = { key: string; en: string; es: string };

/** Palabras de la unidad: al tocar una, suena y muestra qué significa. */
export function WordChips({ words, color }: { words: readonly Word[]; color: string }) {
  const [active, setActive] = useState<string | null>(null);

  async function play(word: Word) {
    setActive(word.key);
    await speak(word.en);
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {words.map((word) => {
        const on = active === word.key;
        return (
          <li key={word.key}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => play(word)}
              className="flex min-h-touch items-center gap-2 rounded-full border-2 bg-surface px-4 py-2 text-left"
              style={{ borderColor: on ? color : "var(--border)" }}
            >
              <span aria-hidden="true">🔊</span>
              <span className="flex flex-col leading-tight">
                <span lang="en" className="font-extrabold">
                  {word.en}
                </span>
                {on && <span className="text-sm text-muted">{word.es}</span>}
              </span>
            </motion.button>
          </li>
        );
      })}
    </ul>
  );
}
