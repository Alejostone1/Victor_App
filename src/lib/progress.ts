import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type LessonProgress = {
  completed: ReadonlySet<string>;
  bestScores: ReadonlyMap<string, number>;
  /** Última lección terminada (para el botón "Continuar"). */
  lastLessonId: string | null;
};

/** Lecciones completadas por el usuario actual (RLS limita a sus filas). Usar dentro de <Suspense>. */
export const getLessonProgress = cache(async (): Promise<LessonProgress> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, best_score, completed_at")
    .order("completed_at", { ascending: false, nullsFirst: false });
  const completed = new Set<string>();
  const bestScores = new Map<string, number>();
  let lastLessonId: string | null = null;
  for (const row of data ?? []) {
    if (row.status === "completed") {
      completed.add(row.lesson_id);
      lastLessonId ??= row.lesson_id;
    }
    bestScores.set(row.lesson_id, row.best_score);
  }
  return { completed, bestScores, lastLessonId };
});
