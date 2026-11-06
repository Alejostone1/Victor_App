import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión y manda a /login.
 * Los Server Components no pueden borrar cookies; por eso, si la sesión apunta a un
 * usuario sin perfil (p. ej. una cuenta borrada), se redirige aquí para evitar un bucle.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
