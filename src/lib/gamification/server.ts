import "server-only";
import { cache } from "react";
import { ERROR_TAG_LABELS, LEARNING_RULES } from "@/lib/config";
import { getRoadmapOrders, getUnits } from "@/lib/content/loader";
import { addDays, localDate } from "@/lib/dates";
import { ACHIEVEMENTS, earnedAchievements, toView, type AchievementView } from "@/lib/gamification/achievements";
import { computeStreak, type StreakInfo } from "@/lib/gamification/streak";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type ActivityRow = Pick<Tables<"daily_activity">, "activity_date" | "minutes_studied" | "xp_earned" | "lessons_completed" | "reviews_completed">;

export type ActivitySummary = {
  today: string;
  streak: StreakInfo;
  minutesToday: number;
  /** Últimos 14 días (del más antiguo a hoy). */
  last14: Array<{ date: string; minutes: number }>;
  totalMinutes: number;
  reviewSessions: number;
};

/** Un día cuenta para la racha si hubo una lección o un repaso (cualquier fila con minutos). */
function isActive(row: ActivityRow): boolean {
  return row.minutes_studied > 0 || row.lessons_completed > 0 || row.reviews_completed > 0;
}

function summarizeActivity(rows: readonly ActivityRow[], today: string): ActivitySummary {
  const byDate = new Map(rows.map((r) => [r.activity_date, r]));
  const streak = computeStreak(rows.filter(isActive).map((r) => r.activity_date), today);
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i - 13);
    return { date, minutes: byDate.get(date)?.minutes_studied ?? 0 };
  });
  return {
    today,
    streak,
    minutesToday: byDate.get(today)?.minutes_studied ?? 0,
    last14,
    totalMinutes: rows.reduce((sum, r) => sum + r.minutes_studied, 0),
    reviewSessions: rows.reduce((sum, r) => sum + r.reviews_completed, 0),
  };
}

async function loadActivity(supabase: Supabase): Promise<ActivityRow[]> {
  const { data } = await supabase
    .from("daily_activity")
    .select("activity_date, minutes_studied, xp_earned, lessons_completed, reviews_completed")
    .order("activity_date", { ascending: false })
    .limit(800);
  return data ?? [];
}

/** Racha, meta de hoy y últimos 14 días del usuario actual. Usar dentro de <Suspense>. */
export const getActivitySummary = cache(async (): Promise<ActivitySummary> => {
  const supabase = await createClient();
  return summarizeActivity(await loadActivity(supabase), localDate());
});

/** Palabras con repaso pendiente hoy y total de palabras aprendidas. */
export const getReviewCounts = cache(async (): Promise<{ due: number; total: number; nextAt: string | null }> => {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [due, total, next] = await Promise.all([
    supabase.from("review_items").select("id", { count: "exact", head: true }).lte("next_review_at", now),
    supabase.from("review_items").select("id", { count: "exact", head: true }),
    supabase.from("review_items").select("next_review_at").gt("next_review_at", now).order("next_review_at").limit(1),
  ]);
  return { due: due.count ?? 0, total: total.count ?? 0, nextAt: next.data?.[0]?.next_review_at ?? null };
});

export type Reinforcement = { tag: string; title: string; icon: string; errors: number };

/**
 * Tema a reforzar: el `errorTag` con más errores en los últimos 7 días (mínimo 3),
 * contando solo los errores posteriores a la última práctica de refuerzo de ese tema.
 */
export const getReinforcement = cache(async (): Promise<Reinforcement | null> => {
  const supabase = await createClient();
  const since = new Date(Date.now() - LEARNING_RULES.reinforcementWindowDays * 86_400_000).toISOString();
  const { data } = await supabase
    .from("attempts")
    .select("lesson_id, is_correct, error_tags, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000);

  const lastPractice = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.lesson_id.startsWith("reinforce:")) {
      const tag = row.lesson_id.slice("reinforce:".length);
      if (!lastPractice.has(tag)) lastPractice.set(tag, row.created_at);
    }
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.is_correct || row.lesson_id.startsWith("reinforce:")) continue;
    for (const tag of row.error_tags ?? []) {
      if (!ERROR_TAG_LABELS[tag]) continue;
      const practiced = lastPractice.get(tag);
      if (practiced && row.created_at <= practiced) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const [tag, errors] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (!tag || !errors || errors < LEARNING_RULES.reinforcementErrorThreshold) return null;
  return { tag, errors, ...ERROR_TAG_LABELS[tag] };
});

export const getUnlockedAchievements = cache(async (): Promise<Map<string, string>> => {
  const supabase = await createClient();
  const { data } = await supabase.from("user_achievements").select("achievement_id, unlocked_at");
  return new Map((data ?? []).map((r) => [r.achievement_id, r.unlocked_at]));
});

/** Suma minutos, XP y lección/repaso al día de hoy. */
export async function recordActivity(
  supabase: Supabase,
  userId: string,
  add: { minutes: number; xp: number; lessons?: number; reviews?: number },
): Promise<void> {
  const today = localDate();
  const { data } = await supabase
    .from("daily_activity")
    .select("minutes_studied, xp_earned, lessons_completed, reviews_completed")
    .eq("activity_date", today)
    .maybeSingle();
  const { error } = await supabase.from("daily_activity").upsert(
    {
      user_id: userId,
      activity_date: today,
      minutes_studied: (data?.minutes_studied ?? 0) + add.minutes,
      xp_earned: (data?.xp_earned ?? 0) + add.xp,
      lessons_completed: (data?.lessons_completed ?? 0) + (add.lessons ?? 0),
      reviews_completed: (data?.reviews_completed ?? 0) + (add.reviews ?? 0),
    },
    { onConflict: "user_id,activity_date" },
  );
  if (error) console.error("[recordActivity]", error.message);
}

/** Suma XP al total del perfil. */
export async function addXp(supabase: Supabase, userId: string, xp: number): Promise<void> {
  if (xp <= 0) return;
  const { data } = await supabase.from("profiles").select("total_xp").eq("id", userId).maybeSingle();
  await supabase.from("profiles").update({ total_xp: (data?.total_xp ?? 0) + xp }).eq("id", userId);
}

/**
 * Revisa todos los logros con el estado actual y guarda los nuevos.
 * `perfectLesson` viene del resultado que se acaba de guardar.
 */
export async function awardAchievements(
  supabase: Supabase,
  userId: string,
  extra: { perfectLesson?: boolean } = {},
): Promise<AchievementView[]> {
  const [existing, progress, activity, words, perfectSpeak, speakCorrect] = await Promise.all([
    supabase.from("user_achievements").select("achievement_id"),
    supabase.from("lesson_progress").select("lesson_id").eq("status", "completed"),
    loadActivity(supabase),
    supabase.from("review_items").select("id", { count: "exact", head: true }),
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("exercise_type", "speak_repeat").gte("score", 100),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .in("exercise_type", ["speak_repeat", "dialogue", "review_speak"])
      .eq("is_correct", true),
  ]);

  const owned = new Set((existing.data ?? []).map((r) => r.achievement_id));
  const completed = new Set((progress.data ?? []).map((r) => r.lesson_id));
  const units = getUnits();
  const doneUnits = units.filter((u) => u.lessons.every((l) => completed.has(l.id)));
  const doneOrders = new Set(doneUnits.filter((u) => u.level === "A1").map((u) => u.order));
  const summary = summarizeActivity(activity, localDate());

  const earned = earnedAchievements({
    lessonsCompleted: completed.size,
    unitsCompleted: doneUnits.length,
    allA1Completed: getRoadmapOrders().every((order) => doneOrders.has(order)),
    streak: summary.streak.current,
    words: words.count ?? 0,
    perfectSpeak: (perfectSpeak.count ?? 0) > 0,
    speakCorrect: speakCorrect.count ?? 0,
    perfectLesson: Boolean(extra.perfectLesson),
    dialoguesCompleted: units.flatMap((u) => u.lessons).filter((l) => l.type === "dialogue" && completed.has(l.id)).length,
    reviewSessions: summary.reviewSessions,
  });

  const fresh = earned.filter((id) => !owned.has(id));
  if (fresh.length === 0) return [];
  const { error } = await supabase
    .from("user_achievements")
    .upsert(fresh.map((achievement_id) => ({ user_id: userId, achievement_id })), {
      onConflict: "user_id,achievement_id",
      ignoreDuplicates: true,
    });
  if (error) {
    console.error("[awardAchievements]", error.message);
    return [];
  }
  return ACHIEVEMENTS.filter((a) => fresh.includes(a.id)).map(toView);
}
