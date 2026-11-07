"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LEARNING_RULES, XP_RULES } from "@/lib/config";
import { addDays, localDate, startOfLocalDay } from "@/lib/dates";
import type { AchievementView } from "@/lib/gamification/achievements";
import { addXp, awardAchievements, recordActivity } from "@/lib/gamification/server";
import { sm2, type Quality } from "@/lib/srs/sm2";
import { createClient } from "@/lib/supabase/server";

const FORMAT_SKILL = { recall: "vocabulary", listen: "listening", speak: "speaking" } as const;

const sessionSchema = z.object({
  durationSeconds: z.number().int().min(0).max(4 * 60 * 60),
  results: z
    .array(
      z.object({
        itemKey: z.string().min(1).max(200),
        format: z.enum(["recall", "listen", "speak"]),
        quality: z.number().int().min(0).max(5),
        score: z.number().int().min(0).max(100).nullable(),
      }),
    )
    .min(1)
    .max(LEARNING_RULES.reviewSessionMaxItems * 2),
});

export type ReviewSessionInput = z.infer<typeof sessionSchema>;
export type ReviewSessionOutput =
  | { ok: true; xp: number; remembered: number; total: number; achievements: AchievementView[] }
  | { ok: false };

/** Aplica SM-2 a cada palabra repasada, suma XP y actividad del día y revisa logros. */
export async function saveReviewSession(input: ReviewSessionInput): Promise<ReviewSessionOutput> {
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[saveReviewSession] datos inválidos", parsed.error.issues.slice(0, 5));
    return { ok: false };
  }
  const { durationSeconds, results } = parsed.data;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { ok: false };

  const keys = [...new Set(results.map((r) => r.itemKey))];
  const { data: items, error } = await supabase
    .from("review_items")
    .select("item_key, ease_factor, interval_days, repetitions")
    .in("item_key", keys);
  if (error || !items) {
    console.error("[saveReviewSession] review_items", error?.message);
    return { ok: false };
  }

  const today = localDate();
  const now = new Date().toISOString();
  const byKey = new Map(items.map((i) => [i.item_key, i]));
  // Si una palabra aparece dos veces, cuenta la última respuesta.
  const lastResult = new Map(results.map((r) => [r.itemKey, r]));

  const updates = [...lastResult.values()].flatMap((r) => {
    const item = byKey.get(r.itemKey);
    if (!item) return [];
    const next = sm2(
      { easeFactor: Number(item.ease_factor), intervalDays: item.interval_days, repetitions: item.repetitions },
      r.quality as Quality,
    );
    return [
      supabase
        .from("review_items")
        .update({
          ease_factor: next.easeFactor,
          interval_days: next.intervalDays,
          repetitions: next.repetitions,
          last_reviewed_at: now,
          next_review_at: startOfLocalDay(addDays(today, next.intervalDays)).toISOString(),
        })
        .eq("item_key", r.itemKey),
    ];
  });
  const updateResults = await Promise.all(updates);
  const failed = updateResults.find((u) => u.error);
  if (failed?.error) {
    console.error("[saveReviewSession] update", failed.error.message);
    return { ok: false };
  }

  // Intentos de repaso (alimentan las barras de habilidades en Progreso).
  await supabase.from("attempts").insert(
    results
      .filter((r) => byKey.has(r.itemKey))
      .map((r) => ({
        user_id: userId,
        lesson_id: "review",
        exercise_id: `review:${r.itemKey}`.slice(0, 200),
        exercise_type: `review_${r.format}`,
        skill: FORMAT_SKILL[r.format],
        is_correct: r.quality >= 3,
        score: r.score,
        user_answer: null,
        error_tags: [],
      })),
  );

  const xp = XP_RULES.reviewSessionCompleted;
  await addXp(supabase, userId, xp);
  await recordActivity(supabase, userId, { minutes: Math.max(1, Math.round(durationSeconds / 60)), xp, reviews: 1 });
  const achievements = await awardAchievements(supabase, userId);
  revalidatePath("/", "layout");

  const remembered = [...lastResult.values()].filter((r) => r.quality >= 3).length;
  return { ok: true, xp, remembered, total: lastResult.size, achievements };
}
