"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { UI_STRINGS } from "@/lib/config";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sound";

const t = UI_STRINGS.lesson;

type Props = { done: number; total: number; onExit: () => void };

/** Barra superior: cerrar, progreso y silenciar. */
export function LessonHeader({ done, total, onExit }: Props) {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  const progress = total === 0 ? 0 : Math.min(1, done / total);

  return (
    <header className="sticky top-0 z-20 bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[720px] items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label={t.exitLabel}
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl text-muted hover:bg-surface"
        >
          ✕
        </button>
        <div
          className="h-5 flex-1 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-label={t.progress(Math.min(done + 1, total), total)}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <motion.div
            className="relative h-full rounded-full bg-success"
            initial={false}
            animate={{ width: `${Math.max(progress * 100, 4)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/35" />
          </motion.div>
        </div>
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? t.unmute : t.mute}
          aria-pressed={muted}
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl hover:bg-surface"
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔔"}</span>
        </button>
      </div>
    </header>
  );
}
