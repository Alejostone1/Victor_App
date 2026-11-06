import type { Exercise, Lesson } from "@/lib/content/schema";

export type AnswerRecord = {
  exerciseId: string;
  isCorrect: boolean;
  score: number | null;
  userAnswer: string | null;
  firstTry: boolean;
  skipped: boolean;
};

/** Ejercicios que se califican (las tarjetas de vocabulario solo enseñan). */
export function isGraded(exercise: Exercise): boolean {
  return exercise.type !== "flashcard";
}

export type LessonSummary = { graded: number; correct: number; percent: number };

/** Porcentaje de aciertos al primer intento (sin contar tarjetas ni ejercicios saltados). */
export function summarize(lesson: Lesson, answers: readonly AnswerRecord[]): LessonSummary {
  const gradedIds = new Set(lesson.exercises.filter(isGraded).map((e) => e.id));
  const first = answers.filter((a) => a.firstTry && !a.skipped && gradedIds.has(a.exerciseId));
  const correct = first.filter((a) => a.isCorrect).length;
  const percent = first.length === 0 ? 100 : Math.round((correct / first.length) * 100);
  return { graded: first.length, correct, percent };
}
