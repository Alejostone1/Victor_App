// Next.js 16 renombró `middleware.ts` a `proxy.ts`.
// TODO(Fase 1): refrescar la sesión de Supabase y redirigir a /login las rutas (app) sin sesión.
import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|sounds/|manifest.webmanifest|sw.js).*)",
  ],
};
