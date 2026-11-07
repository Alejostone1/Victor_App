"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DAILY_GOAL_OPTIONS, UI_STRINGS, VOICE_RATE_OPTIONS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  dailyGoalMinutes: z.number().refine((n) => (DAILY_GOAL_OPTIONS as readonly number[]).includes(n)),
  voiceRate: z.number().refine((n) => VOICE_RATE_OPTIONS.some((o) => o.value === n)),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type SettingsResult = { ok: true } | { ok: false; error: string };

export async function updateSettings(input: SettingsInput): Promise<SettingsResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: UI_STRINGS.settings.invalid };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { ok: false, error: UI_STRINGS.genericError };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      daily_goal_minutes: parsed.data.dailyGoalMinutes,
      voice_rate: parsed.data.voiceRate,
    })
    .eq("id", userId);
  if (error) {
    console.error("[updateSettings]", error.message);
    return { ok: false, error: UI_STRINGS.genericError };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
