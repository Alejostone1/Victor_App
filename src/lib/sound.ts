// Sonidos cortos de acierto, error y lección completa, generados con Web Audio
// (sin archivos). Se pueden silenciar; la preferencia se guarda en este dispositivo.

const MUTE_KEY = "englishpath:muted";
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

/** Para useSyncExternalStore: avisa cuando cambia el silencio. */
export function subscribeMuted(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Sin almacenamiento disponible: el cambio dura solo esta visita.
  }
  listeners.forEach((l) => l());
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || isMuted()) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, start: number, duration: number, type: OscillatorType, volume = 0.18) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playCorrect(): void {
  const c = audio();
  if (!c) return;
  tone(c, 659, 0, 0.14, "sine");
  tone(c, 988, 0.1, 0.22, "sine");
}

export function playWrong(): void {
  const c = audio();
  if (!c) return;
  tone(c, 330, 0, 0.18, "triangle", 0.14);
  tone(c, 262, 0.14, 0.26, "triangle", 0.12);
}

export function playComplete(): void {
  const c = audio();
  if (!c) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.11, 0.3, "sine", 0.16));
}

export function playTap(): void {
  const c = audio();
  if (!c) return;
  tone(c, 520, 0, 0.06, "sine", 0.06);
}
