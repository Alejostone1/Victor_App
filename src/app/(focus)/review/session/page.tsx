import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ReviewSession, type ReviewCard } from "@/components/review/ReviewSession";
import { requireOnboardedProfile } from "@/lib/auth/session";
import { LEARNING_RULES } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export default function ReviewSessionPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-72 w-full max-w-[720px] animate-pulse rounded-3xl bg-border" />}>
      <SessionLoader />
    </Suspense>
  );
}

/** Carga las palabras pendientes (o, si no hay, las próximas) y arma la sesión. */
async function SessionLoader() {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const now = new Date().toISOString();
  const limit = LEARNING_RULES.reviewSessionMaxItems;

  const { data: due } = await supabase
    .from("review_items")
    .select("item_key, front, back, audio_text")
    .lte("next_review_at", now)
    .order("next_review_at")
    .limit(limit);
  let rows = due ?? [];
  if (rows.length === 0) {
    // "Practicar igual": las que vuelven más pronto.
    const { data: upcoming } = await supabase
      .from("review_items")
      .select("item_key, front, back, audio_text")
      .order("next_review_at")
      .limit(10);
    rows = upcoming ?? [];
  }
  if (rows.length === 0) redirect("/review");

  const { data: poolRows } = await supabase.from("review_items").select("back").limit(80);
  const items: ReviewCard[] = rows.map((r) => ({
    key: r.item_key,
    front: r.front,
    back: r.back,
    audio: r.audio_text ?? r.front,
  }));

  return <ReviewSession items={items} pool={(poolRows ?? []).map((r) => r.back)} voiceRate={profile.voice_rate} />;
}
