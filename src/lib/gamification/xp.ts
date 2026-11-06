import { XP_RULES } from "@/lib/config";

export type XpInput = {
  /** Ejercicios calificables acertados al primer intento. */
  correctFirstTry: number;
  /** Ejercicios de pronunciación con puntaje >= umbral. */
  greatPronunciations: number;
  completed: boolean;
  perfect: boolean;
};

/** XP de una lección (sección 10). */
export function lessonXp({ correctFirstTry, greatPronunciations, completed, perfect }: XpInput): number {
  let xp = correctFirstTry * XP_RULES.correctExercise + greatPronunciations * XP_RULES.pronunciationBonus;
  if (completed) xp += XP_RULES.lessonCompleted;
  if (completed && perfect) xp += XP_RULES.perfectLessonBonus;
  return xp;
}
