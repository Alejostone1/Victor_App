"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { UI_STRINGS } from "@/lib/config";
import { pickBestAlternative, scorePronunciation, type PronunciationResult } from "@/lib/speech/compare";
import { isSpeechRecognitionSupported, listen, SpeechError } from "@/lib/speech/stt";
import { stopSpeaking } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

/** null mientras no se sabe (en el servidor); true/false en el navegador. */
export function useSpeechRecognitionSupport(): boolean | null {
  return useSyncExternalStore(noopSubscribe, isSpeechRecognitionSupported, () => null);
}

export type MicState =
  | { kind: "idle" }
  | { kind: "listening" }
  | { kind: "result"; result: PronunciationResult; transcript: string }
  | { kind: "error"; message: string };

/** Graba, puntúa contra el texto esperado y recuerda el mejor intento. */
export function usePronunciation(expected: string) {
  const [state, setState] = useState<MicState>({ kind: "idle" });
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState<{ score: number; transcript: string } | null>(null);

  async function record(): Promise<PronunciationResult | null> {
    stopSpeaking();
    setState({ kind: "listening" });
    try {
      const { transcript } = await listen({ pickBest: (alts) => pickBestAlternative(expected, alts) });
      const result = scorePronunciation(expected, transcript);
      setAttempts((n) => n + 1);
      setBest((b) => (!b || result.score > b.score ? { score: result.score, transcript } : b));
      setState({ kind: "result", result, transcript });
      return result;
    } catch (err) {
      const message = err instanceof SpeechError ? err.message : UI_STRINGS.speechErrors.unknown;
      setState({ kind: "error", message });
      return null;
    }
  }

  return { state, attempts, best, record };
}

export function MicButton({ listening, onClick, disabled }: { listening: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || listening}
      whileTap={{ scale: 0.92 }}
      aria-label={UI_STRINGS.lesson.micLabel}
      className={cn(
        "relative flex size-24 items-center justify-center rounded-full text-5xl shadow-[0_5px_0_0_rgb(0_0_0/0.2)] disabled:cursor-default",
        listening ? "bg-error text-error-foreground" : "bg-primary text-primary-foreground",
      )}
    >
      {listening && (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-error"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-error"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.35 }}
          />
        </>
      )}
      <span aria-hidden="true" className="relative">
        🎤
      </span>
    </motion.button>
  );
}

/** Frase con las palabras no reconocidas resaltadas en naranja. */
export function HighlightedWords({ result }: { result: PronunciationResult }) {
  return (
    <p lang="en" className="text-center text-2xl font-bold leading-relaxed">
      {result.words.map((w, i) => (
        <span
          key={`${w.word}-${i}`}
          className={cn(
            "mx-1 inline-block",
            w.matched ? "text-success" : "text-error underline decoration-wavy decoration-2 underline-offset-4",
          )}
        >
          {w.word}
        </span>
      ))}
    </p>
  );
}

/** Círculo con el puntaje, verde si alcanza el mínimo. */
export function ScoreBadge({ score, passed }: { score: number; passed: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 16 }}
      className={cn(
        "flex size-24 flex-col items-center justify-center rounded-full border-4 text-3xl font-extrabold",
        passed ? "border-success bg-success-soft text-success" : "border-error bg-error-soft text-error",
      )}
      role="status"
      aria-label={`${score}%`}
    >
      {score}%
    </motion.div>
  );
}
