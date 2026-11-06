"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LEARNING_RULES, XP_RULES } from "@/lib/config";
import { getLessonRef, getNextLesson } from "@/lib/content/loader";
import { lessonXp } from "@/lib/gamification/xp";
import { createClient } from "@/lib/supabase/server";
import { isGraded, summarize } from "./summary";

const resultSchema = z.object({
  lessonId: z.string().min(1).max(64),
  durationSeconds: z.number().int().min(0).max(4 * 60 * 60),
  /** Fecha local del usuario (YYYY-MM-DD) para la actividad diaria. */
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers: z
    .array(
      z.object({
        exerciseId: z.string().min(1).max(64),
        isCorrect: z.boolean(),
        score: z.number().int().min(0).max(100).nullable(),
        userAnswer: z.string().max(300).nullable(),
        firstTry: z.boolean(),
        skipped: z.boolean(),
      }),
    )
    .max(200),
});

export type LessonResultInput = z.infer<typeof resultSchema>;
export type LessonResultOutput =
  | {
      ok: true;
      percent: number;
      correct: number;
      graded: number;
      xp: number;
      passed: boolean;
      /** 100% con al menos un ejercicio calificado (saltarse todo no es "perfecto"). */
      perfect: boolean;
      nextLessonId: string | null;
      unitCompleted: boolean;
    }
  | { ok: false };

/**
 * Guarda el resultado de una lección: intentos, progreso, XP, actividad del día y
 * palabras para repasar. El puntaje y la XP se recalculan aquí desde el contenido.
 */
export async function saveLessonResult(input: LessonResultInput): Promise<LessonResultOutput> {
  const parsed = resultSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[saveLessonResult] datos inválidos", parsed.error.issues.slice(0, 5));
    return { ok: false };
  }
  const { lessonId, durationSeconds, localDate, answers } = parsed.data;

  const ref = getLessonRef(lessonId);
  if (!ref) {
    console.error("[saveLessonResult] lección desconocida", lessonId);
    return { ok: false };
  }
  const { lesson, unit } = ref;
  const exercises = new Map(lesson.exercises.map((e) => [e.id, e]));
  const validAnswers = answers.filter((a) => exercises.has(a.exerciseId));

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) {
    console.error("[saveLessonResult] sin sesión");
    return { ok: false };
  }

  const summary = summarize(lesson, validAnswers);
  const passed = lesson.type !== "checkpoint" || summary.percent >= LEARNING_RULES.checkpointPassPercent;
  const perfect = passed && summary.graded > 0 && summary.percent === 100;
  const greatPronunciations = validAnswers.filter(
    (a) =>
      a.firstTry &&
      exercises.get(a.exerciseId)?.type === "speak_repeat" &&
      (a.score ?? 0) >= XP_RULES.pronunciationBonusThreshold,
  ).length;
  const xp = lessonXp({
    correctFirstTry: summary.correct,
    greatPronunciations,
    completed: passed,
    perfect,
  });

  // 1) Intentos (solo ejercicios calificables y no saltados).
  const attemptRows = validAnswers.flatMap((a) => {
    const ex = exercises.get(a.exerciseId);
    if (!ex || !isGraded(ex) || a.skipped) return [];
    return [
      {
        user_id: userId,
        lesson_id: lessonId,
        exercise_id: `${lessonId}:${ex.id}`,
        exercise_type: ex.type,
        skill: ex.skill,
        is_correct: a.isCorrect,
        score: a.score,
        user_answer: a.userAnswer,
        error_tags: a.isCorrect ? [] : (ex.errorTags ?? []),
      },
    ];
  });
  if (attemptRows.length > 0) {
    const { error } = await supabase.from("attempts").insert(attemptRows);
    if (error) {
      console.error("[saveLessonResult] attempts", error.message);
      return { ok: false };
    }
  }

  // 2) Progreso de la lección.
  if (passed) {
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("best_score, times_completed")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        unit_id: unit.id,
        status: "completed",
        best_score: Math.max(existing?.best_score ?? 0, summary.percent),
        times_completed: (existing?.times_completed ?? 0) + 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) {
      console.error("[saveLessonResult] lesson_progress", error.message);
      return { ok: false };
    }

    // 3) Palabras y frases para el repaso espaciado (no reinicia las que ya existen).
    const reviewRows = [
      ...(lesson.vocab ?? []).map((v) => ({ item_key: v.key, front: v.en, back: v.es, audio_text: v.en })),
      ...lesson.exercises.flatMap((e) =>
        e.type === "speak_repeat"
          ? [{ item_key: `phrase:${e.text.toLowerCase()}`, front: e.text, back: e.es, audio_text: e.text }]
          : [],
      ),
    ].map((r) => ({ ...r, user_id: userId }));
    if (reviewRows.length > 0) {
      await supabase
        .from("review_items")
        .upsert(reviewRows, { onConflict: "user_id,item_key", ignoreDuplicates: true });
    }
  }

  // 4) XP total y actividad del día.
  if (xp > 0) {
    const { data: profile } = await supabase.from("profiles").select("total_xp").eq("id", userId).maybeSingle();
    await supabase
      .from("profiles")
      .update({ total_xp: (profile?.total_xp ?? 0) + xp })
      .eq("id", userId);
  }
  const { data: today } = await supabase
    .from("daily_activity")
    .select("minutes_studied, xp_earned, lessons_completed")
    .eq("activity_date", localDate)
    .maybeSingle();
  await supabase.from("daily_activity").upsert(
    {
      user_id: userId,
      activity_date: localDate,
      minutes_studied: (today?.minutes_studied ?? 0) + Math.max(1, Math.round(durationSeconds / 60)),
      xp_earned: (today?.xp_earned ?? 0) + xp,
      lessons_completed: (today?.lessons_completed ?? 0) + (passed ? 1 : 0),
    },
    { onConflict: "user_id,activity_date" },
  );

  // El inicio y las unidades deben mostrar el progreso nuevo al volver.
  revalidatePath("/", "layout");

  const next = getNextLesson(lessonId);
  return {
    ok: true,
    percent: summary.percent,
    correct: summary.correct,
    graded: summary.graded,
    xp,
    passed,
    perfect,
    nextLessonId: next?.lesson.id ?? null,
    unitCompleted: passed && (next === undefined || next.unit.id !== unit.id),
  };
}
