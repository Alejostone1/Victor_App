import { z } from "zod";
import { UI_STRINGS } from "@/lib/config";

/**
 * Supabase Auth exige un correo, pero la app usa solo usuario + contraseña.
 * Cada usuario recibe un correo interno `<usuario>@englishpath.local` que nunca recibe mensajes
 * (la confirmación por correo está desactivada en Supabase).
 */
export const INTERNAL_EMAIL_DOMAIN = "englishpath.local";

const t = UI_STRINGS.login;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, t.usernameTooShort)
  .max(20, t.usernameTooLong)
  .regex(/^[a-z0-9._-]+$/, t.usernameInvalid);

export const passwordSchema = z.string().min(6, t.passwordTooShort).max(72, t.passwordTooLong);

export const credentialsSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export function usernameToEmail(username: string): string {
  return `${username}@${INTERNAL_EMAIL_DOMAIN}`;
}
