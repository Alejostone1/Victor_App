"use client";

import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, useAutoPlay } from "@/components/lesson/AudioButtons";
import { ExerciseTitle } from "@/components/lesson/ExerciseTitle";
import {
  HighlightedWords,
  MicButton,
  ScoreBadge,
  usePronunciation,
  useSpeechRecognitionSupport,
} from "@/components/lesson/Pronunciation";
import { Button } from "@/components/ui/Button";
import { SPEECH_CONFIG, UI_STRINGS } from "@/lib/config";
import { playCorrect, playWrong } from "@/lib/sound";
import type { ExerciseProps } from "./types";

const t = UI_STRINGS.lesson;

/** Escucha y repite: puntaje por palabras reconocidas, hasta 3 intentos. */
export function SpeakRepeat({ exercise, retry, onAnswer }: ExerciseProps<"speak_repeat">) {
  const supported = useSpeechRecognitionSupport();
  const { state, attempts, best, record } = usePronunciation(exercise.text);
  useAutoPlay(exercise.text);

  const min = exercise.minScore;
  const maxAttempts = SPEECH_CONFIG.maxSpeakAttempts;
  const passed = (best?.score ?? 0) >= min;
  const canRetry = attempts < maxAttempts && (best?.score ?? 0) < 100;
  const listening = state.kind === "listening";

  async function handleMic() {
    const result = await record();
    if (result) (result.score >= min ? playCorrect : playWrong)();
  }

  function finish() {
    onAnswer({ isCorrect: passed, score: best?.score ?? 0, userAnswer: best?.transcript ?? null, feedback: null });
  }

  function skip() {
    onAnswer({ isCorrect: false, skipped: true, feedback: null });
  }

  const message =
    state.kind === "listening"
      ? t.speakListening
      : state.kind === "result"
        ? state.result.score >= 90
          ? t.speakGreat
          : state.result.score >= min
            ? t.speakGood
            : t.speakLow
        : t.speakTap;

  return (
    <div className="flex flex-col gap-6">
      <ExerciseTitle retry={retry}>{t.instructions.speak_repeat}</ExerciseTitle>

      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-surface px-4 py-6">
        {state.kind === "result" ? (
          <HighlightedWords result={state.result} />
        ) : (
          <p lang="en" className="text-center text-3xl font-extrabold">
            {exercise.text}
          </p>
        )}
        <p className="text-center text-lg text-muted">{exercise.es}</p>
        <ListenControls text={exercise.text} size="md" className="pt-3" />
      </div>

      {supported === false ? (
        <p className="rounded-2xl bg-error-soft p-4 text-center font-semibold">{UI_STRINGS.speechNotSupported}</p>
      ) : (
        <div className="flex flex-col items-center gap-4" aria-live="polite">
          {state.kind === "result" ? (
            <ScoreBadge score={state.result.score} passed={state.result.score >= min} />
          ) : (
            <MicButton listening={listening} onClick={handleMic} disabled={supported === null} />
          )}
          <p className="text-center text-xl font-bold">{message}</p>
          {state.kind === "result" && state.result.score < 100 && (
            <p className="text-center text-muted">{t.speakMissed}</p>
          )}
          {state.kind === "result" && canRetry && (
            <p className="text-sm font-semibold text-muted">{t.speakAttempts(maxAttempts - attempts)}</p>
          )}
          {state.kind === "error" && (
            <p className="rounded-2xl bg-error-soft p-4 text-center font-semibold">{state.message}</p>
          )}
        </div>
      )}

      <ActionBar>
        {attempts > 0 && state.kind !== "listening" ? (
          passed || !canRetry ? (
            <>
              <Button variant={passed ? "success" : "primary"} onClick={finish}>
                {UI_STRINGS.continue}
              </Button>
              {canRetry && (
                <Button variant="ghost" onClick={handleMic}>
                  🎤 {UI_STRINGS.tryAgain}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={handleMic}>🎤 {UI_STRINGS.tryAgain}</Button>
              <Button variant="ghost" onClick={finish}>
                {UI_STRINGS.continue}
              </Button>
            </>
          )
        ) : (
          <Button variant="ghost" onClick={skip} disabled={listening}>
            {UI_STRINGS.skipForNow}
          </Button>
        )}
      </ActionBar>
    </div>
  );
}
