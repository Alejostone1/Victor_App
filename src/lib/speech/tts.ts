// Texto a voz con SpeechSynthesis (sección 8 de la especificación).
import { SPEECH_CONFIG } from "@/lib/config";

let cachedVoice: SpeechSynthesisVoice | null = null;
let defaultRate: number = SPEECH_CONFIG.normalRate;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Ajusta la velocidad normal (viene de profiles.voice_rate). */
export function setVoiceRate(rate: number): void {
  defaultRate = rate;
}

/** En Android las voces llegan tarde: espera a `voiceschanged` (máx. 1,5 s). */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);

  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, 1500);
    synth.addEventListener("voiceschanged", done);
  });
}

function normalizeLang(lang: string): string {
  return lang.replace("_", "-").toLowerCase();
}

/** Prioriza voces en-US "Google" o "Natural", luego cualquier en-US, luego cualquier inglés. */
async function pickVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedVoice) return cachedVoice;
  const voices = await loadVoices();
  const target = SPEECH_CONFIG.lang.toLowerCase();
  const enUs = voices.filter((v) => normalizeLang(v.lang) === target);
  const preferred = enUs.find((v) => /google|natural/i.test(v.name));
  const anyEnglish = voices.find((v) => normalizeLang(v.lang).startsWith("en"));
  cachedVoice = preferred ?? enUs[0] ?? anyEnglish ?? null;
  return cachedVoice;
}

/** Lee el texto en inglés. Cancela cualquier audio anterior. Resuelve al terminar. */
export async function speak(text: string, opts: { slow?: boolean } = {}): Promise<void> {
  if (!isSpeechSynthesisSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const voice = await pickVoice();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_CONFIG.lang;
  utterance.rate = opts.slow ? SPEECH_CONFIG.slowRate : defaultRate;
  if (voice) utterance.voice = voice;

  await new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
