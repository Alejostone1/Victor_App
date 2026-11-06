"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { isSpeechRecognitionSupported, listen, SpeechError } from "@/lib/speech/stt";
import { isSpeechSynthesisSupported, speak } from "@/lib/speech/tts";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.onboarding;
const noopSubscribe = () => () => {};
const serverSnapshot = () => null;

type MicState ={ kind: "idle" } | { kind: "listening" } | { kind: "heard"; text: string } | { kind: "error"; message: string };

/** Paso 3 del onboarding: prueba de altavoz (TTS) y micrófono (reconocimiento de voz). */
export function AudioCheck() {
  // El soporte solo se conoce en el navegador; en el servidor es null.
  const tts = useSyncExternalStore(noopSubscribe, isSpeechSynthesisSupported, serverSnapshot);
  const stt = useSyncExternalStore(noopSubscribe, isSpeechRecognitionSupported, serverSnapshot);
  const support = tts === null || stt === null ? null : { tts, stt };
  const [speaking, setSpeaking] = useState(false);
  const [mic, setMic] = useState<MicState>({ kind: "idle" });

  async function handleListen() {
    setSpeaking(true);
    await speak(t.audioPhrase);
    setSpeaking(false);
  }

  async function handleMic() {
    setMic({ kind: "listening" });
    try {
      const { transcript } = await listen({ timeoutMs: 7000 });
      setMic({ kind: "heard", text: transcript });
    } catch (err) {
      const message = err instanceof SpeechError ? err.message : UI_STRINGS.speechErrors.unknown;
      setMic({ kind: "error", message });
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold">{t.audioTitle}</h1>

      <div className="flex flex-col gap-3">
        <p className="text-muted">{t.audioHint}</p>
        <p className="text-xl font-bold" lang="en">
          {t.audioPhrase}
        </p>
        <Button variant="secondary" onClick={handleListen} disabled={speaking || support?.tts === false}>
          <span aria-hidden="true">🔊</span> {t.audioButton}
        </Button>
      </div>

      <hr className="border-border" />

      <div className="flex flex-col gap-3">
        {support?.stt === false ? (
          <p className="rounded-xl bg-error-soft p-3 font-semibold">{UI_STRINGS.speechNotSupported}</p>
        ) : (
          <>
            <p className="text-muted">{t.micHint}</p>
            <Button
              variant="secondary"
              onClick={handleMic}
              disabled={mic.kind === "listening" || support === null}
              className={cn(mic.kind === "listening" && "animate-pulse border-primary")}
            >
              <span aria-hidden="true">🎤</span> {mic.kind === "listening" ? t.micListening : t.micButton}
            </Button>
          </>
        )}

        <div aria-live="polite">
          {mic.kind === "heard" && (
            <p className="rounded-xl bg-success-soft p-3 font-semibold">{t.micHeard(mic.text)}</p>
          )}
          {mic.kind === "error" && <p className="rounded-xl bg-error-soft p-3 font-semibold">{mic.message}</p>}
        </div>
      </div>

      <p className="text-sm text-muted">{t.skipHint}</p>
    </>
  );
}
