"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DAILY_GOAL_OPTIONS, UI_STRINGS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  dailyGoalMinutes: z
    .number()
    .int()
    .refine((n) => (DAILY_GOAL_OPTIONS as readonly number[]).includes(n)),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ActionResult = { error: string } | undefined;

/** Guarda nombre y meta diaria, marca el onboarding como completado y va al inicio. */
export async function completeOnboarding(input: OnboardingInput): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: UI_STRINGS.onboarding.invalid };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      daily_goal_minutes: parsed.data.dailyGoalMinutes,
      onboarding_completed: true,
    })
    .eq("id", userId);

  if (error) return { error: UI_STRINGS.genericError };
  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
