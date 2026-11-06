import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

/**
 * Capa de acceso a datos de la sesión (DAL).
 * Devuelve el perfil del usuario con sesión o redirige a /login.
 * Lee cookies: úsala dentro de <Suspense>. `cache` evita repetir la consulta en la misma petición.
 */
export const getCurrentProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  // Sesión válida pero sin perfil (cuenta borrada): cerrar sesión para no entrar en bucle.
  if (!profile) redirect("/logout");

  return profile;
});

/** Igual que getCurrentProfile, pero envía al onboarding si aún no lo completó. */
export async function requireOnboardedProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile.onboarding_completed) redirect("/onboarding");
  return profile;
}
