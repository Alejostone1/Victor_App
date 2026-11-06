// Lee y valida las variables públicas de Supabase.
// Se leen de forma literal (process.env.NEXT_PUBLIC_...) para que Next las incruste en el cliente.

export function getSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copia .env.local.example a .env.local y complétalas.",
    );
  }

  return { url, publishableKey };
}
