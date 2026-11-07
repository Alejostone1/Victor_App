// Racha con 1 día de descanso gratis por semana (sección 10).
import { LEARNING_RULES } from "@/lib/config";
import { addDays, weekStart } from "@/lib/dates";

export type StreakInfo = {
  /** Días con actividad que cuentan para la racha actual. */
  current: number;
  /** Mejor racha histórica. */
  best: number;
  /** Hoy ya tiene actividad. */
  todayDone: boolean;
  /** Días sin actividad cubiertos por el descanso semanal dentro de la racha actual. */
  restDays: string[];
  /** Había practicado antes, pero la racha se rompió (mensaje de bienvenida). */
  broken: boolean;
};

/**
 * Cuenta la racha hacia atrás desde hoy. Un día sin actividad no la rompe si es el
 * primero de su semana (lunes a domingo) que falta. Hoy, si aún no practica, no cuenta
 * pero tampoco rompe: el día no ha terminado.
 */
export function computeStreak(activeDates: Iterable<string>, today: string): StreakInfo {
  const active = new Set(activeDates);
  const todayDone = active.has(today);
  const sorted = [...active].sort();
  const first = sorted[0];
  if (!first) return { current: 0, best: 0, todayDone: false, restDays: [], broken: false };

  const { current, restDays } = walkBack(active, todayDone ? today : addDays(today, -1), first);
  const best = Math.max(current, bestStreak(sorted, active));
  return { current, best, todayDone, restDays, broken: current === 0 };
}

function walkBack(active: ReadonlySet<string>, from: string, first: string) {
  const restUsed = new Map<string, number>();
  const restDays: string[] = [];
  // Un descanso solo cuenta si más atrás hay otro día activo (queda "entre" dos días de práctica).
  let pending: string[] = [];
  let current = 0;
  for (let day = from; day >= first; day = addDays(day, -1)) {
    if (active.has(day)) {
      current++;
      restDays.push(...pending);
      pending = [];
      continue;
    }
    const week = weekStart(day);
    const used = restUsed.get(week) ?? 0;
    if (used >= LEARNING_RULES.freeRestDaysPerWeek) break;
    restUsed.set(week, used + 1);
    pending.push(day);
  }
  return { current, restDays };
}

/** Mejor racha: se recorre cada día activo como posible final de racha. */
function bestStreak(sorted: readonly string[], active: ReadonlySet<string>): number {
  let best = 0;
  for (const end of sorted) {
    // Solo hace falta evaluar los finales de bloque (el día siguiente no está activo).
    if (active.has(addDays(end, 1))) continue;
    best = Math.max(best, walkBack(active, end, sorted[0]).current);
  }
  return best;
}
