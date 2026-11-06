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
- Auth: enlace mágico. `/callback` acepta `?code=` (PKCE) y `?token_hash=&type=`. El proxy reenvía a `/callback` cualquier `?code=` que llegue a otra ruta.
- Sesión en el servidor: usar `getCurrentProfile()` / `requireOnboardedProfile()` de `src/lib/auth/session.ts`, siempre dentro de `<Suspense>`.
- El correo por defecto de Supabase solo envía a miembros del equipo de la organización y con límite de 2 correos por hora: para usuarios reales hay que configurar SMTP propio.
- Auth URL config (hecha): Site URL `https://victor-app-three.vercel.app`; Redirect URLs `https://victor-app-three.vercel.app/**` y `http://localhost:3000/**`.
- Las plantillas de correo solo se pueden editar con SMTP propio. Pendiente: al configurarlo, cambiar "Confirm sign up" y "Magic link" a `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` para que el enlace funcione en cualquier navegador (hoy es PKCE: debe abrirse en el mismo navegador donde se pidió).

## Deploy
- GitHub `Alejostone1/Victor_App` (rama `main`) → Vercel proyecto `victor-app` (deploy automático). Producción: https://victor-app-three.vercel.app

## Arquitectura
- **Contenido** (unidades, lecciones, ejercicios) en JSON versionado: `content/a1/unit-XX.json`, validado con Zod (`src/lib/content/`). La BD **solo** guarda progreso del usuario.
- BD Supabase con RLS en todas las tablas: `profiles`, `lesson_progress`, `attempts`, `review_items`, `daily_activity`, `user_achievements` (`supabase/migrations/0001_init.sql`).
- Auth: enlace mágico por correo. Rutas `(app)` protegidas desde `src/proxy.ts`.
- Lógica de negocio en `src/lib/` (grading, speech, srs, gamification); los componentes solo pintan.
- Estado de la lección en curso: `src/stores/lessonStore.ts` (Zustand).
- Textos de UI y constantes (XP, reglas, voz): `src/lib/config.ts`.

## Reglas de código
- TypeScript estricto, sin `any`.
- Server Components por defecto; `'use client'` solo en lo interactivo.
- Todo JSON de contenido se valida con Zod al cargar (error claro en desarrollo).
- Errores amigables: nunca mostrar trazas al usuario.
- Probar en 360px (Android) y 1440px (PC).
- Entorno: Windows + PowerShell; los comandos deben ser compatibles con PowerShell.

## Fases
- [x] **Fase 0** — Setup: proyecto, dependencias, estructura con placeholders, `.env.local.example`, `config.ts`, este archivo.
- [x] **Fase 1** — BD y auth (migración, clientes Supabase, magic link, proxy, onboarding).
- [ ] **Fase 2** — Contenido y motor de lección (Zod, unidad 1, voz, grading, 9 ejercicios).
- [ ] **Fase 3** — Gamificación y adaptación (XP, racha, meta, logros, SM-2, `/review`, refuerzo).
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
