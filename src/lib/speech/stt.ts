// Voz a texto con webkitSpeechRecognition (sección 8). No existe en Firefox.
import { SPEECH_CONFIG, UI_STRINGS } from "@/lib/config";

// Tipos mínimos: lib.dom no declara el constructor SpeechRecognition.
type RecognitionAlternative = { transcript: string; confidence: number };
type RecognitionResult = { length: number; isFinal: boolean; [index: number]: RecognitionAlternative };
type RecognitionResultEvent = Event & { results: { length: number; [index: number]: RecognitionResult } };
type RecognitionErrorEvent = Event & { error: string };

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionConstructor() !== null;
}

export type SpeechErrorCode = "not-supported" | "not-allowed" | "no-speech" | "network" | "audio-capture" | "unknown";

export class SpeechError extends Error {
  constructor(public readonly code: SpeechErrorCode) {
    super(UI_STRINGS.speechErrors[code]);
    this.name = "SpeechError";
  }
}

function toErrorCode(error: string): SpeechErrorCode {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "not-allowed";
    case "no-speech":
      return "no-speech";
    case "network":
      return "network";
    case "audio-capture":
      return "audio-capture";
    default:
      return "unknown";
  }
}

export type ListenResult = { transcript: string; alternatives: string[] };

/**
 * Escucha una frase en inglés.
 * `pickBest` elige la mejor alternativa contra el texto esperado (Fase 2: compare.ts);
 * por defecto usa la primera.
 */
export function listen(
  opts: { timeoutMs?: number; pickBest?: (alternatives: string[]) => string } = {},
): Promise<ListenResult> {
  const Ctor = getRecognitionConstructor();
  if (!Ctor) return Promise.reject(new SpeechError("not-supported"));

  const recognition = new Ctor();
  recognition.lang = SPEECH_CONFIG.lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  return new Promise<ListenResult>((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      recognition.abort();
      finish(() => reject(new SpeechError("no-speech")));
    }, opts.timeoutMs ?? 8000);

    recognition.onresult = (event) => {
      const result = event.results[0];
      const alternatives: string[] = [];
      for (let i = 0; i < (result?.length ?? 0); i++) {
        const alt = result[i]?.transcript.trim();
        if (alt) alternatives.push(alt);
      }
      if (alternatives.length === 0) {
        finish(() => reject(new SpeechError("no-speech")));
        return;
      }
      const transcript = opts.pickBest ? opts.pickBest(alternatives) : alternatives[0];
      finish(() => resolve({ transcript, alternatives }));
    };

    recognition.onerror = (event) => {
      finish(() => reject(new SpeechError(toErrorCode(event.error))));
    };

    recognition.onend = () => {
      finish(() => reject(new SpeechError("no-speech")));
    };

    try {
      recognition.start();
    } catch {
      finish(() => reject(new SpeechError("unknown")));
    }
  });
}
