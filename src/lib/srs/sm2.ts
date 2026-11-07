// Repaso espaciado SM-2 (sección 9.1).

/** 0-2 = falló, 3 = difícil, 4 = bien, 5 = fácil. */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export type SrsState = { easeFactor: number; intervalDays: number; repetitions: number };

/** Siguiente estado del ítem según qué tan bien lo recordó. */
export function sm2(item: SrsState, quality: Quality): SrsState {
  let { repetitions, intervalDays } = item;
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.round(intervalDays * item.easeFactor);
  }
  const easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { easeFactor: Math.round(easeFactor * 100) / 100, intervalDays, repetitions };
}
