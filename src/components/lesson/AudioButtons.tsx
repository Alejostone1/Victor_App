"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UI_STRINGS } from "@/lib/config";
import { speak, stopSpeaking } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";

type Speed = "normal" | "slow";

/** Reproduce un texto en inglés y expone qué velocidad está sonando. */
export function useSpeaker() {
  const [speaking, setSpeaking] = useState<Speed | null>(null);
  async function play(text: string, speed: Speed = "normal") {
    setSpeaking(speed);
    await speak(text, { slow: speed === "slow" });
    setSpeaking(null);
  }
  return { speaking, play };
}

/** Suena una vez al aparecer (si el navegador lo permite) y se calla al salir. */
export function useAutoPlay(text: string, enabled = true) {
  useEffect(() => {
    if (enabled) void speak(text);
    return () => stopSpeaking();
  }, [text, enabled]);
}

type ListenControlsProps = {
  text: string;
  size?: "lg" | "md";
  className?: string;
};

/** Botón grande 🔊 + botón 🐢 lento. */
export function ListenControls({ text, size = "lg", className }: ListenControlsProps) {
  const { speaking, play } = useSpeaker();
  const big = size === "lg";

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => play(text)}
        aria-label={UI_STRINGS.listen}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_5px_0_0_rgb(0_0_0/0.2)]",
          big ? "size-24 text-5xl" : "size-16 text-3xl",
        )}
      >
        {speaking === "normal" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-4 border-primary"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}
        <span aria-hidden="true">🔊</span>
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => play(text, "slow")}
        aria-label={UI_STRINGS.slow}
        className={cn(
          "flex items-center justify-center rounded-full border-2 border-border bg-surface",
          big ? "size-16 text-3xl" : "size-12 text-2xl",
          speaking === "slow" && "border-primary",
        )}
      >
        <span aria-hidden="true">🐢</span>
      </motion.button>
    </div>
  );
}

/** Botón pequeño 🔊 para frases dentro de tarjetas o del panel de feedback. */
export function MiniListen({ text, className }: { text: string; className?: string }) {
  const { speaking, play } = useSpeaker();
  return (
    <button
      type="button"
      onClick={() => play(text)}
      aria-label={`${UI_STRINGS.listen}: ${text}`}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface text-xl",
        speaking && "border-primary",
        className,
      )}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
