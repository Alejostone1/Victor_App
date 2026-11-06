"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { MiniListen } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import {
  HighlightedWords,
  MicButton,
  ScoreBadge,
  usePronunciation,
  useSpeechRecognitionSupport,
} from "@/components/lesson/Pronunciation";
import { Button } from "@/components/ui/Button";
import type { DialogueLine } from "@/lib/content/schema";
import { SPEECH_CONFIG, UI_STRINGS } from "@/lib/config";
import { playCorrect, playWrong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";
import type { ExerciseProps } from "./types";

const t = UI_STRINGS.lesson;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Conversación por turnos: la app habla y el usuario responde en voz alta. */
export function Dialogue({ exercise, retry, onAnswer }: ExerciseProps<"dialogue">) {
  const { lines } = exercise;
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(0);
  const [scores, setScores] = useState<Array<number | null>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const current = started ? lines[shown] : undefined;
  const done = started && shown >= lines.length;

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown, done]);

  /** Muestra y pronuncia las líneas del otro personaje hasta el siguiente turno del usuario. */
  async function playPartnerLines(from: number) {
    let i = from;
    while (i < lines.length && !lines[i].userTurn) {
      setShown(i + 1);
      await speak(lines[i].en);
      await wait(250);
      i++;
    }
    setShown(i);
  }

  function begin() {
    setStarted(true);
    void playPartnerLines(0);
  }

  function finishTurn(score: number | null) {
    setScores((s) => [...s, score]);
    void playPartnerLines(shown + 1);
  }

  function finish() {
    const numeric = scores.filter((s): s is number => s !== null);
    // Si saltó todos los turnos (p. ej. sin micrófono), no cuenta para el puntaje.
    if (numeric.length === 0) {
      onAnswer({ isCorrect: false, skipped: true, feedback: null });
      return;
    }
    const allPassed = numeric.every((s) => s >= SPEECH_CONFIG.defaultMinScore);
    const average = Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length);
    onAnswer({ isCorrect: allPassed, score: average, userAnswer: null, feedback: null });
  }

  return (
    <div className="flex flex-col gap-5">
      <ExerciseTitle retry={retry}>{t.instructions.dialogue}</ExerciseTitle>

      <div className="flex flex-col gap-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {lines.slice(0, shown).map((line, i) => (
            <Bubble key={i} line={line} />
          ))}
        </AnimatePresence>
      </div>

      {!started && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-border bg-surface p-6 text-center">
          <span className="text-6xl" aria-hidden="true">
            💬
          </span>
          <p className="text-lg text-muted">{t.dialogueIntro(lines.find((l) => !l.userTurn)?.speaker ?? "")}</p>
          <Button onClick={begin}>{t.dialogueStart}</Button>
        </div>
      )}

      {current?.userTurn && <UserTurn key={shown} line={current} onDone={finishTurn} />}

      {done && (
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-2xl font-extrabold text-success"
          role="status"
        >
          🎉 {t.dialogueDone}
        </motion.p>
      )}
      <div ref={bottomRef} className="h-px" />

      {done && (
        <ActionBar>
          <Button variant="success" onClick={finish}>
            {UI_STRINGS.continue}
          </Button>
        </ActionBar>
      )}
    </div>
  );
}

function Bubble({ line }: { line: DialogueLine }) {
  const mine = line.userTurn;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex items-end gap-2", mine && "flex-row-reverse")}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full text-2xl",
          mine ? "bg-primary/15" : "bg-success-soft",
        )}
      >
        {mine ? "🙂" : "👩"}
      </span>
      <div
        className={cn(
          "flex max-w-[80%] items-center gap-2 rounded-3xl px-4 py-3",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border-2 border-border bg-surface",
        )}
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold opacity-75">{line.speaker}</span>
          <span lang="en" className="text-xl font-bold">
            {line.en}
          </span>
          <span className="text-base opacity-80">{line.es}</span>
        </div>
        {!mine && <MiniListen text={line.en} />}
      </div>
    </motion.div>
  );
}

function UserTurn({ line, onDone }: { line: DialogueLine; onDone: (score: number | null) => void }) {
  const supported = useSpeechRecognitionSupport();
  const { state, attempts, best, record } = usePronunciation(line.en);
  const min = SPEECH_CONFIG.defaultMinScore;
  const passed = (best?.score ?? 0) >= min;
  const canRetry = attempts < SPEECH_CONFIG.maxSpeakAttempts;

  async function handleMic() {
    const result = await record();
    if (result) (result.score >= min ? playCorrect : playWrong)();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-3xl border-2 border-primary bg-primary/5 p-5"
    >
      <p className="font-bold text-primary">{t.dialogueYourTurn}</p>
      {state.kind === "result" ? (
        <HighlightedWords result={state.result} />
      ) : (
        <p lang="en" className="text-center text-2xl font-extrabold">
          {line.en}
        </p>
      )}
      <div className="flex items-center gap-2">
        <p className="text-muted">{line.es}</p>
        <MiniListen text={line.en} />
      </div>

      {supported === false ? (
        <>
          <p className="rounded-2xl bg-error-soft p-3 text-center font-semibold">{UI_STRINGS.speechNotSupported}</p>
          <Button onClick={() => onDone(null)}>{t.dialogueSaid}</Button>
        </>
      ) : (
        <>
          {state.kind === "result" ? (
            <ScoreBadge score={state.result.score} passed={state.result.score >= min} />
          ) : (
            <MicButton listening={state.kind === "listening"} onClick={handleMic} disabled={supported === null} />
          )}
          {state.kind === "listening" && <p className="font-bold">{t.speakListening}</p>}
          {state.kind === "error" && (
            <p className="rounded-2xl bg-error-soft p-3 text-center font-semibold">{state.message}</p>
          )}
          {attempts > 0 && state.kind !== "listening" && (
            <div className="flex w-full flex-col gap-2">
              {passed || !canRetry ? (
                <Button variant={passed ? "success" : "primary"} onClick={() => onDone(best?.score ?? 0)}>
                  {t.dialogueMoveOn} ➜
                </Button>
              ) : (
                <>
                  <Button onClick={handleMic}>🎤 {UI_STRINGS.tryAgain}</Button>
                  <Button variant="ghost" onClick={() => onDone(best?.score ?? 0)}>
                    {t.dialogueMoveOn}
                  </Button>
                </>
              )}
            </div>
          )}
          {attempts === 0 && state.kind !== "listening" && (
            <Button variant="ghost" onClick={() => onDone(null)}>
              {UI_STRINGS.skipForNow}
            </Button>
          )}
        </>
      )}
    </motion.div>
  );
}
