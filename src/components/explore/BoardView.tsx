"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Visual } from "@/components/ui/Visual";
import { UI_STRINGS } from "@/lib/config";
import type { Board, BoardTile } from "@/lib/content/boards";
import { speak, stopSpeaking } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.lesson;

/** Tablero para tocar y escuchar: arriba queda fija la ficha elegida con su pronunciación. */
export function BoardView({ board }: { board: Board }) {
  const [current, setCurrent] = useState<BoardTile | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  async function play(tile: BoardTile, slow = false) {
    setCurrent(tile);
    setPlaying(true);
    await speak(tile.say, { slow });
    setPlaying(false);
  }

  const isAlphabet = board.id === "alphabet";
  const isColors = board.id === "colors";

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pt-2 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex items-center gap-4 rounded-3xl border-4 bg-surface p-4"
              style={{ borderColor: board.color }}
              aria-live="polite"
            >
              <span className="flex size-20 shrink-0 items-center justify-center">
                {isColors ? (
                  <Visual visual={{ color: current.color }} size="md" />
                ) : (
                  <span lang="en" className="text-5xl font-black" style={{ color: board.color }}>
                    {isAlphabet ? `${current.label}${current.label.toLowerCase()}` : current.label}
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                {!isAlphabet && (
                  <span lang="en" className="text-2xl font-extrabold">
                    {current.say}
                  </span>
                )}
                <span className="text-lg font-bold text-[#8a5a00] dark:text-[#f5c542]">
                  🗣️ {t.soundsLike} «{current.hint}»
                </span>
                <span className="text-muted">
                  {isAlphabet && current.example
                    ? `${current.example.emoji} ${current.example.en} = ${current.example.es}`
                    : current.es}
                </span>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => play(current)}
                  aria-label={UI_STRINGS.listen}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full text-2xl text-white shadow-[0_3px_0_0_rgb(0_0_0/0.2)]",
                    playing && "animate-pulse",
                  )}
                  style={{ backgroundColor: board.color }}
                >
                  <span aria-hidden="true">🔊</span>
                </button>
                <button
                  type="button"
                  onClick={() => play(current, true)}
                  aria-label={UI_STRINGS.slow}
                  className="flex size-12 items-center justify-center rounded-full border-2 border-border bg-surface text-2xl"
                >
                  <span aria-hidden="true">🐢</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border-2 border-dashed p-4 text-center text-lg font-semibold"
              style={{ borderColor: board.color }}
            >
              👆 {board.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ul
        className={cn(
          "grid gap-3",
          isColors ? "grid-cols-2 sm:grid-cols-3" : isAlphabet ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5",
        )}
      >
        {board.tiles.map((tile) => {
          const active = current?.id === tile.id;
          return (
            <li key={tile.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => play(tile)}
                aria-label={`${tile.label}, ${tile.es}`}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 bg-surface p-3 shadow-[0_4px_0_0_var(--border)] transition-colors",
                  isColors ? "min-h-32" : "aspect-square",
                  active ? "border-4" : "border-border",
                )}
                style={active ? { borderColor: board.color } : undefined}
              >
                {isColors ? (
                  <>
                    <Visual visual={{ color: tile.color }} size="md" />
                    <span lang="en" className="text-xl font-extrabold">
                      {tile.label}
                    </span>
                    <span className="text-sm text-muted">{tile.es}</span>
                  </>
                ) : isAlphabet ? (
                  <>
                    <span lang="en" className="text-4xl font-black" style={{ color: board.color }}>
                      {tile.label}
                      <span className="text-3xl opacity-70">{tile.label.toLowerCase()}</span>
                    </span>
                    <span className="text-sm font-bold text-muted">
                      {tile.example?.emoji} «{tile.hint}»
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-black" style={{ color: board.color }}>
                      {tile.label}
                    </span>
                    <span lang="en" className="text-center text-sm leading-tight font-bold">
                      {tile.say}
                    </span>
                  </>
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
