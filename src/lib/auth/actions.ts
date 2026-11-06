"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DAILY_GOAL_OPTIONS, UI_STRINGS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, usernameToEmail } from "./username";

export type AuthFormState = { error: string | null; username: string };

function readCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
}

function rawUsername(formData: FormData): string {
  const value = formData.get("username");
  return typeof value === "string" ? value.trim() : "";
}

/** Entrar con usuario y contraseña. */
export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const username = rawUsername(formData);
  const parsed = readCredentials(formData);
  if (!parsed.success) return { error: UI_STRINGS.login.wrongCredentials, username };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });

  if (error) {
    const message =
      error.status === 429 ? UI_STRINGS.login.rateLimited : UI_STRINGS.login.wrongCredentials;
    return { error: message, username };
  }
  redirect("/");
}

/** Crear cuenta con usuario y contraseña. Entra de inmediato (sin confirmar correo). */
export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const username = rawUsername(formData);
  const parsed = readCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? UI_STRINGS.genericError, username };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? UI_STRINGS.login.usernameTaken
        : error.code === "weak_password"
          ? UI_STRINGS.login.passwordTooShort
          : error.status === 429
            ? UI_STRINGS.login.rateLimited
            : UI_STRINGS.genericError;
    return { error: message, username };
  }
  // Si Supabase devolviera un usuario sin sesión, ese usuario ya existía.
  if (!data.session) return { error: UI_STRINGS.login.usernameTaken, username };

  redirect("/");
}

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
