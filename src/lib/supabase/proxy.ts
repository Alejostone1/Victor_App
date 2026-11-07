import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/** Rutas que no requieren sesión. */
const PUBLIC_PATHS = ["/login", "/callback", "/logout", "/offline"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refresca la sesión de Supabase (cookies) y protege las rutas privadas.
 * - Sin sesión en ruta privada → /login (o 401 en /api).
 * - Con sesión en /login → inicio.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // No pongas código entre createServerClient y getClaims(): refresca el token.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);
  const { pathname, searchParams } = request.nextUrl;

  // Si Supabase no reconoce la URL de retorno, manda el enlace mágico al "Site URL"
  // con ?code= o ?token_hash=. Lo reenviamos a /callback para no perder el inicio de sesión.
  if (pathname !== "/callback" && (searchParams.has("code") || searchParams.has("token_hash"))) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/callback";
    return redirectWithCookies(callbackUrl, response);
  }

  if (!isLoggedIn && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return redirectWithCookies(loginUrl, response);
  }

  if (isLoggedIn && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return redirectWithCookies(homeUrl, response);
  }

  return response;
}

/** Redirige conservando las cookies de sesión que Supabase acaba de escribir. */
function redirectWithCookies(target: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(target);
  for (const cookie of from.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  const cacheControl = from.headers.get("Cache-Control");
  if (cacheControl) redirect.headers.set("Cache-Control", cacheControl);
  return redirect;
}
