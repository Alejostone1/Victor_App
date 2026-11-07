@AGENTS.md

# EnglishPath — guía para Claude Code

Especificación completa: [docs/prompt-maestro-plataforma-ingles.md](docs/prompt-maestro-plataforma-ingles.md). Léela antes de empezar una fase nueva.

## Qué es
Plataforma web (PWA) para que **el Padre Victor** (adulto hispanohablante, nivel cero) aprenda inglés como hobby, para **comunicarse**. Se usa en Chrome Android y en PC (Chrome/Edge). Desarrollador: Alejandro Piedrahita (DesarPro).

## Principios (obligatorios)
1. Comunicación antes que gramática: escuchar 40%, hablar 30%, vocabulario 20%, escribir 10%.
2. Sin presión: ánimo, nunca castigos; sin vidas; la racha admite 1 día de descanso por semana.
3. Simple y grande: botones ≥ 48px (`min-h-touch`), base 18px, alto contraste, un paso a la vez.
4. Interfaz en español; el inglés es el contenido.
5. Lecciones de 5 a 10 minutos.
6. Adaptativo: repaso espaciado (SM-2) y registro de errores por `errorTags`.

## Stack
Next.js 16 (App Router, `src/`, TS estricto) · Tailwind CSS v4 · Framer Motion · Supabase (`@supabase/supabase-js` + `@supabase/ssr`) · Zod v4 · Zustand · Web Speech API (TTS + `webkitSpeechRecognition`, `en-US`) · Serwist (PWA) · Vercel · API de Claude (fase 5).

## Diferencias con la especificación original (por versiones nuevas)
- **`src/proxy.ts`** en lugar de `src/middleware.ts`: Next 16 renombró la convención (la función se exporta como `proxy`). El helper de Supabase es `src/lib/supabase/proxy.ts`.
- **Sin `tailwind.config.ts`**: Tailwind v4 define el tema en CSS. Los design tokens están en `src/app/globals.css` (`:root`, `[data-theme="dark"]` y `@theme inline`). Colores: `primary`, `success`, `error` (naranja), `muted`, `surface`, `border`.
- `next.config.ts` trae `cacheComponents: true` y `partialPrefetching: true` (valores por defecto de create-next-app 16). Con Cache Components, los datos por petición (cookies, params, Supabase) deben ir dentro de `<Suspense>` o en componentes dinámicos. Consulta `node_modules/next/dist/docs/` antes de escribir código de Next.
- Next 16 usa Turbopack por defecto; al integrar Serwist en la fase 4 hay que verificar su compatibilidad con Turbopack.
- Variable `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clave moderna `sb_publishable_…`) en lugar de `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `profiles.onboarding_completed` (boolean) se agregó al esquema para saber si mostrar el onboarding.

## Supabase
- Proyecto `english-path` (ref `axnopzbphibutwrawbqu`, us-east-1). Tipos generados en `src/types/database.ts`: regenerarlos tras cada migración.
- **Auth: usuario + contraseña** (decisión del dueño: nada de correos ni confirmaciones). Supabase exige correo, así que cada usuario usa uno interno `<usuario>@englishpath.local` (`src/lib/auth/username.ts`). "Confirm email" está **desactivado** en Supabase (Authentication → Sign In / Providers). Registro abierto desde `/login` ("¿Primera vez? Crear una cuenta").
- Usuario: 3–20 caracteres `[a-z0-9._-]`, se guarda en minúsculas. Contraseña: mínimo 6.
- Sin correo no hay "olvidé mi contraseña": se cambia por SQL (`update auth.users set encrypted_password = crypt('<nueva>', gen_salt('bf')) where email = '<usuario>@englishpath.local'`).
- Server actions `signIn` / `signUp` / `signOut` en `src/lib/auth/actions.ts`.
- Sesión en el servidor: usar `getCurrentProfile()` / `requireOnboardedProfile()` de `src/lib/auth/session.ts`, siempre dentro de `<Suspense>`.
- Quedó de la versión anterior (enlace mágico) `/callback` y el reenvío de `?code=` en el proxy; no se usan pero no estorban.
- Auth URL config: Site URL `https://victor-app-three.vercel.app`; Redirect URLs `https://victor-app-three.vercel.app/**` y `http://localhost:3000/**`.

## Deploy
- GitHub `Alejostone1/Victor_App` (rama `main`) → Vercel proyecto `victor-app` (deploy automático). Producción: https://victor-app-three.vercel.app

## Arquitectura
- **Contenido** (unidades, lecciones, ejercicios) en JSON versionado: `content/a1/unit-XX.json`, validado con Zod (`src/lib/content/`). La BD **solo** guarda progreso del usuario.
- BD Supabase con RLS en todas las tablas: `profiles`, `lesson_progress`, `attempts`, `review_items`, `daily_activity`, `user_achievements` (`supabase/migrations/0001_init.sql`).
- Auth: usuario y contraseña (ver sección Supabase). Rutas `(app)` protegidas desde `src/proxy.ts`.
- Lógica de negocio en `src/lib/` (grading, speech, srs, gamification); los componentes solo pintan.
- Estado de la lección en curso: `src/stores/lessonStore.ts` (Zustand).
- Textos de UI y constantes (XP, reglas, voz): `src/lib/config.ts`.

## Motor de lección (Fase 2)
- **Agregar una unidad**: crear `content/a1/unit-XX.json` e importarlo en `RAW_UNITS` de `src/lib/content/loader.ts`. Las unidades sin contenido salen como "Próximamente" desde `content/a1/roadmap.json`. Las tarjetas aceptan `emoji` opcional.
- Desbloqueo derivado: la primera lección de **cada unidad** está abierta (se elige el tema libremente); dentro de la unidad, una lección se abre al completar la anterior (`isLessonUnlocked`). "Continuar" sigue en la unidad de la última lección terminada (`getContinueLesson`). Solo se guardan filas `completed` en `lesson_progress`.
- Unidades con contenido: 1 Saludos, 2 Abecedario, 3 Números, 4 Colores. Cada unidad tiene `color` (#rrggbb oscuro, texto blanco encima) y `description`; cada lección puede tener `icon`.
- Ejercicios visuales: `tap_choose` (escucha y toca color/letra/número/emoji) y `picture_choose` (mira y elige la palabra). Las tarjetas aceptan `color`, `symbol`, `hint` ("suena como") y `say` (texto para la voz, p. ej. letras: "bee"). En `grammarTip.example` solo va inglés (lo lee la voz en inglés).
- `normalize` convierte cifras en palabras ("21" → "twenty one") porque el micrófono devuelve números.
- **Explorar** (`/explore`, `/explore/[board]`): tableros para tocar y escuchar (abecedario, números, colores) en `src/lib/content/boards.ts`.
- Inicio: botón Continuar, "¿Cómo funciona?" (solo sin progreso), tableros, tarjetas de temas y "Muy pronto". El camino en zigzag vive en la página de cada unidad.
- La lección vive en `src/app/(focus)/lesson/[lessonId]` (pantalla completa, sin barra de navegación). Unidad y lección usan `generateStaticParams` y leen `params` dentro de `<Suspense>`.
- `LessonPlayer` + `useLessonStore`: lo fallado se reinserta al final una vez ("Repaso"); tarjetas y ejercicios saltados no cuentan para el %. Diálogo con todos los turnos saltados = saltado.
- `saveLessonResult` (server action) recalcula % y XP desde el contenido, guarda `attempts`, `lesson_progress`, `review_items` (vocab + frases de `speak_repeat`), suma `profiles.total_xp` y `daily_activity`, y llama `revalidatePath('/', 'layout')`. El reproductor depende de `lesson.id` (no del objeto) para no reiniciarse con esa revalidación.
- Checkpoint: se aprueba con ≥ 70 % al primer intento; si no, "¡Casi!" + "Intentar de nuevo".
- Mezclas con `seededShuffle` (deterministas por ejercicio) para evitar errores de hidratación.
- Sonidos con Web Audio en `src/lib/sound.ts` (sin mp3); silencio guardado en `localStorage`.
- Pronunciación: `scorePronunciation` (LCS por palabras, tolera 1 letra en palabras ≥ 4) y `pickBestAlternative` en `src/lib/speech/compare.ts`.

## Gamificación y repaso (Fase 3)
- **Día local**: todo se cuenta en `APP_CONFIG.timeZone` (America/Bogota) con `src/lib/dates.ts`; el servidor decide la fecha, no el cliente.
- **Racha** (`lib/gamification/streak.ts`, pura): un día cuenta si tiene fila en `daily_activity` con minutos/lección/repaso. 1 día sin práctica por semana (lunes–domingo) no rompe la racha si queda entre dos días activos. Hoy sin práctica no rompe (el día no ha terminado).
- **Lado servidor** (`lib/gamification/server.ts`): `getActivitySummary`, `getReviewCounts`, `getReinforcement`, `getUnlockedAchievements` (con `cache`), y `recordActivity`, `addXp`, `awardAchievements` que usan las server actions de lección y repaso.
- **Logros** en `lib/gamification/achievements.ts` (13, se evalúan al guardar lección o repaso y salen en la pantalla final).
- **SM-2** en `lib/srs/sm2.ts`. Las palabras nuevas vuelven al día siguiente a las 00:00 locales. `/review` (resumen) y `/review/session` (pantalla completa, grupo `(focus)`): alterna recordar (se autocalifica 1/3/5), escuchar y elegir (4/1) y pronunciar (≥90→5, ≥70→4, si no 2). `saveReviewSession` en `lib/review/actions.ts`. La sesión congela su lista de palabras porque `revalidatePath` vuelve a pintar la página.
- **Refuerzo**: `errorTag` con ≥3 errores en 7 días (solo los posteriores a su último refuerzo) → tarjeta en el inicio → `/practice/[tag]` con hasta 8 ejercicios de lecciones abiertas (`lib/content/reinforcement.ts`, ids `leccion:ejercicio`). Se guarda con `saveLessonResult` usando `lessonId = reinforce:<tag>` (sin `lesson_progress`). Nombres de tags en `ERROR_TAG_LABELS`.
- Migración `0002_review_sessions.sql`: `daily_activity.reviews_completed`.
- Ajustes: nombre, meta, velocidad de voz (`VOICE_RATE_OPTIONS`, se aplica en toda la app con `VoiceRateSync`), sonidos, prueba de micrófono y cerrar sesión.

## Reglas de código
- TypeScript estricto, sin `any`.
- Server Components por defecto; `'use client'` solo en lo interactivo.
- Todo JSON de contenido se valida con Zod al cargar (error claro en desarrollo).
- Errores amigables: nunca mostrar trazas al usuario.
- Probar en 360px (Android) y 1440px (PC).
- Entorno: Windows + PowerShell; los comandos deben ser compatibles con PowerShell.

## Fases
- [x] **Fase 0** — Setup: proyecto, dependencias, estructura con placeholders, `.env.local.example`, `config.ts`, este archivo.
- [x] **Fase 1** — BD y auth (migración, clientes Supabase, usuario+contraseña, proxy, onboarding).
- [x] **Fase 2** — Contenido y motor de lección (Zod, unidad 1, voz, grading, 9 ejercicios). XP, actividad diaria y `review_items` ya se escriben al terminar una lección.
- [x] **Fase 3** — Gamificación y adaptación (XP, racha, meta, logros, SM-2, `/review`, refuerzo, progreso, ajustes).
- [ ] **Fase 4** — PWA (manifest, Serwist) y deploy en Vercel.
- [ ] **Fase 5** — Tutor IA con la API de Claude.
- [ ] **Fase 6** — Unidades 2–10 de A1, luego A2.

Al terminar cada fase: detenerse, resumir y esperar confirmación.

## Comandos
```powershell
npm run dev     # http://localhost:3000
npm run build
npm run lint
```
