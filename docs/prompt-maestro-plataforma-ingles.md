# 🎓 Prompt Maestro — Plataforma de Inglés Personalizada

> **Instrucciones para Claude Code:** Este documento es la especificación completa del proyecto. Léelo entero antes de escribir código. Construye el proyecto **en el orden exacto de las fases** (sección 12): primero carpetas, luego archivos y luego código. Al terminar cada fase, detente, muestra un resumen de lo hecho y espera confirmación antes de seguir. El entorno de desarrollo es **Windows con PowerShell**: todos los comandos deben ser compatibles con PowerShell.

---

## 1. Contexto del proyecto

| Campo | Valor |
|---|---|
| **Nombre (provisional)** | `EnglishPath` (configurable en `lib/config.ts`) |
| **Usuario principal** | Padre Victor: adulto hispanohablante, nivel **cero** en inglés |
| **Motivación** | Hobby. Quiere aprender para **comunicarse** (hablar y entender) |
| **Dispositivos** | Celular **Android** (Chrome) y **PC** (Chrome / Edge) |
| **Acceso** | Por un link (web), 100% responsive e instalable como PWA |
| **Desarrollador** | Alejandro Piedrahita (DesarPro) |

### Principios de diseño (obligatorios)

1. **Comunicación antes que gramática.** El peso de las actividades es: escuchar 40%, hablar 30%, vocabulario 20% y escribir 10%.
2. **Sin presión.** Es un hobby. Usa mensajes de ánimo y nunca castigos. La racha permite días de descanso.
3. **Simple y grande.** Botones de al menos 48px, letra base de 18px, alto contraste y un paso a la vez. El usuario no es experto en tecnología.
4. **Español como apoyo.** Las instrucciones y explicaciones van en español. El inglés es el contenido.
5. **Sesiones cortas.** Una lección dura entre 5 y 10 minutos.
6. **Adaptativo.** Lo que falla se repite (repaso espaciado y registro de errores).

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js** (última versión estable, App Router, TypeScript estricto) | `src/` directory |
| Estilos | **Tailwind CSS** | Design tokens en `tailwind.config` / CSS variables |
| Componentes | **shadcn/ui** (opcional) + componentes propios | Solo los necesarios |
| Animaciones | **Framer Motion** | Feedback de acierto y error, transiciones |
| Backend / BD | **Supabase** (Postgres + Auth + Storage) | Cliente `@supabase/supabase-js` + `@supabase/ssr` |
| Validación | **Zod** | Valida el contenido JSON de los ejercicios y los inputs |
| Estado cliente | **Zustand** | Estado de la sesión de lección en curso |
| Voz: escuchar | **Web Speech API – `SpeechSynthesis`** | Voz `en-US`, velocidad normal (0.9) y lenta (0.6) |
| Voz: pronunciar | **Web Speech API – `SpeechRecognition`** | `webkitSpeechRecognition`, `lang = 'en-US'` |
| PWA | **Serwist** (`@serwist/next`) | Manifest, íconos, instalable en Android |
| Hosting | **Vercel** | Deploy desde GitHub |
| IA (fase 4) | **API de Claude** (ruta de servidor) | Tutor de conversación y corrección |

> ⚠️ El reconocimiento de voz **no funciona en Firefox**. Detecta el soporte y, si no existe, muestra un aviso amable: *"Para practicar pronunciación abre la app en Google Chrome"*. Deja que el usuario salte el ejercicio sin penalización.

---

## 3. Estructura de carpetas

```
english-path/
├── public/
│   ├── icons/                  # Íconos PWA (192, 512, maskable)
│   ├── images/vocab/           # Imágenes de vocabulario (SVG/WebP)
│   └── sounds/                 # correct.mp3, wrong.mp3, complete.mp3
├── content/
│   └── a1/
│       ├── unit-01.json        # Contenido de lecciones (JSON)
│       ├── unit-02.json
│       └── ...
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # Barra inferior (móvil) / lateral (PC)
│   │   │   ├── page.tsx                # Inicio: ruta de unidades
│   │   │   ├── unit/[unitId]/page.tsx
│   │   │   ├── lesson/[lessonId]/page.tsx   # Motor de lección
│   │   │   ├── review/page.tsx         # Repaso espaciado del día
│   │   │   ├── progress/page.tsx       # Estadísticas
│   │   │   ├── achievements/page.tsx   # Logros
│   │   │   └── settings/page.tsx       # Meta diaria, velocidad de voz
│   │   ├── api/
│   │   │   └── attempts/route.ts       # Guarda intentos (opcional, o server actions)
│   │   ├── manifest.ts
│   │   ├── sw.ts                       # Service worker (Serwist)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── exercises/                  # Un componente por tipo de ejercicio
│   │   │   ├── ListenChoose.tsx
│   │   │   ├── ListenType.tsx
│   │   │   ├── SpeakRepeat.tsx
│   │   │   ├── WordOrder.tsx
│   │   │   ├── FillBlank.tsx
│   │   │   ├── Translate.tsx
│   │   │   ├── MatchPairs.tsx
│   │   │   ├── Flashcard.tsx
│   │   │   ├── Dialogue.tsx
│   │   │   └── ExerciseRenderer.tsx    # Switch por `type`
│   │   ├── lesson/
│   │   │   ├── LessonHeader.tsx        # Barra de progreso + cerrar
│   │   │   ├── FeedbackSheet.tsx       # Panel inferior acierto/error
│   │   │   ├── GrammarTip.tsx
│   │   │   └── LessonComplete.tsx      # XP ganado, logros nuevos
│   │   ├── path/
│   │   │   ├── UnitPath.tsx            # Camino visual de unidades
│   │   │   └── LessonNode.tsx
│   │   ├── gamification/
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── XpBar.tsx
│   │   │   ├── DailyGoalRing.tsx
│   │   │   └── AchievementToast.tsx
│   │   └── ui/                         # Botones, tarjetas, modales
│   ├── lib/
│   │   ├── config.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── speech/
│   │   │   ├── tts.ts                  # speak(text, {slow})
│   │   │   ├── stt.ts                  # listen(): Promise<transcript>
│   │   │   └── compare.ts              # Puntaje de pronunciación
│   │   ├── srs/
│   │   │   └── sm2.ts                  # Algoritmo de repaso espaciado
│   │   ├── content/
│   │   │   ├── schema.ts               # Esquemas Zod del contenido
│   │   │   └── loader.ts               # Carga y valida JSON de unidades
│   │   ├── gamification/
│   │   │   ├── xp.ts
│   │   │   ├── streak.ts
│   │   │   └── achievements.ts         # Definición y evaluación de logros
│   │   ├── grading.ts                  # Normaliza y compara respuestas
│   │   └── utils.ts
│   ├── stores/
│   │   └── lessonStore.ts              # Zustand: ejercicio actual, vidas, errores
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                   # Protege rutas (app)
├── .env.local.example
├── CLAUDE.md                           # Resumen de este documento para futuras sesiones
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Variables de entorno

`.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Solo servidor, para el seed
ANTHROPIC_API_KEY=                # Fase 4
NEXT_PUBLIC_APP_NAME=EnglishPath
```

---

## 5. Base de datos (Supabase / Postgres)

Archivo: `supabase/migrations/0001_init.sql`. Activa **RLS en todas las tablas** para que cada usuario solo lea y escriba sus propios datos.

```sql
-- Perfil del usuario (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Estudiante',
  daily_goal_minutes int not null default 10 check (daily_goal_minutes in (5,10,15,20)),
  voice_rate numeric not null default 0.9,
  total_xp int not null default 0,
  current_level text not null default 'A1',
  created_at timestamptz not null default now()
);

-- Progreso por lección
create table public.lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,            -- ej: 'a1-u01-l01'
  unit_id text not null,              -- ej: 'a1-u01'
  status text not null default 'locked' check (status in ('locked','available','completed')),
  best_score int not null default 0,  -- 0..100
  times_completed int not null default 0,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- Cada respuesta del usuario (base para la adaptación)
create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  exercise_id text not null,
  exercise_type text not null,
  skill text not null check (skill in ('listening','speaking','vocabulary','writing','reading')),
  is_correct boolean not null,
  score int,                          -- 0..100 (pronunciación)
  user_answer text,
  error_tags text[] default '{}',     -- ej: {'verb_to_be','th_sound'}
  created_at timestamptz not null default now()
);

-- Repaso espaciado (SM-2)
create table public.review_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,             -- ej: 'vocab:hello' o 'phrase:how-are-you'
  front text not null,                -- inglés
  back text not null,                 -- español
  audio_text text,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  unique (user_id, item_key)
);

-- Actividad diaria (racha y meta)
create table public.daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  minutes_studied int not null default 0,
  xp_earned int not null default 0,
  lessons_completed int not null default 0,
  is_rest_day boolean not null default false,
  primary key (user_id, activity_date)
);

-- Logros desbloqueados
create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,       -- definidos en código (lib/gamification/achievements.ts)
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.daily_activity enable row level security;
alter table public.user_achievements enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own progress" on public.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts" on public.attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reviews" on public.review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own activity" on public.daily_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own achievements" on public.user_achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Crear perfil automáticamente al registrarse
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Estudiante'));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();
```

> **Decisión de arquitectura:** el **contenido** (unidades, lecciones, ejercicios) vive en archivos JSON versionados en `content/`, no en la base de datos. La BD solo guarda **progreso y datos del usuario**. Así se agregan unidades sin migraciones.

---

## 6. Autenticación

- Login con **enlace mágico por correo** (Supabase Auth, OTP por email). Sin contraseñas que recordar.
- Opcional: permitir "Recordar sesión" indefinidamente (sesión persistente).
- `middleware.ts` redirige a `/login` si no hay sesión en rutas `(app)`.
- Al primer ingreso hay un onboarding de 3 pantallas: nombre, meta diaria y una prueba de audio y micrófono.

---

## 7. Formato del contenido (JSON + Zod)

### 7.1 Estructura de una unidad

```ts
// src/lib/content/schema.ts (resumen)
Unit = {
  id: string;              // 'a1-u01'
  level: 'A1' | 'A2' | 'B1';
  order: number;
  title: string;           // 'Saludar y despedirse'
  titleEn: string;         // 'Greetings'
  icon: string;            // emoji o nombre de ícono
  lessons: Lesson[];
}

Lesson = {
  id: string;              // 'a1-u01-l01'
  title: string;
  type: 'learn' | 'practice' | 'dialogue' | 'checkpoint';
  grammarTip?: { es: string; example: string };
  vocab?: VocabItem[];     // se agregan a review_items al completar
  exercises: Exercise[];
}

VocabItem = { key: string; en: string; es: string; image?: string };
```

### 7.2 Tipos de ejercicio

Cada ejercicio tiene `id`, `type`, `skill` y opcionalmente `errorTags`.

| `type` | Habilidad | Descripción | Campos clave |
|---|---|---|---|
| `flashcard` | vocabulary | Presenta palabra: imagen + audio + traducción | `en`, `es`, `image` |
| `listen_choose` | listening | Escucha y elige la opción correcta | `audio`, `options[]`, `answer` |
| `listen_type` | listening | Dictado: escucha y escribe | `audio`, `answer`, `accept[]` |
| `speak_repeat` | speaking | Escucha y repite en voz alta | `text`, `es`, `minScore` (def. 70) |
| `word_order` | writing | Ordena las palabras | `es`, `words[]`, `answer` |
| `fill_blank` | writing | Completa el espacio | `sentence` (con `___`), `options[]`, `answer` |
| `translate` | writing | Traduce frase corta (es→en) | `es`, `answer`, `accept[]` |
| `match_pairs` | vocabulary | Une inglés con español | `pairs[[en, es]]` |
| `dialogue` | speaking/listening | Diálogo por turnos: la app habla, el usuario responde por voz | `lines[{speaker, en, es, userTurn}]` |

### 7.3 Reglas de calificación (`lib/grading.ts`)

- Normaliza: minúsculas, sin puntuación, espacios colapsados, contracciones equivalentes (`i'm` = `i am`, `what's` = `what is`).
- `listen_type` y `translate`: correcto si coincide con `answer` o con alguno de `accept[]`. Si la distancia de Levenshtein es ≤ 1 por palabra, se marca **"Casi, revisa la ortografía"** y cuenta como correcto con aviso.
- `speak_repeat`: puntaje = % de palabras esperadas reconocidas en orden (alineación por palabra), de 0 a 100. Resalta en rojo las palabras que no reconoció.

---

## 8. Motor de voz (`lib/speech/`)

### `tts.ts`
- `speak(text: string, opts?: { slow?: boolean })`
- Selecciona la mejor voz `en-US` disponible (prioriza las que contienen "Google" o "Natural" en el nombre) y la guarda en caché.
- `rate`: el valor de `profiles.voice_rate`, o 0.6 si `slow`.
- Cancela cualquier audio previo antes de hablar.
- En Android, espera al evento `voiceschanged` antes de elegir voz.

### `stt.ts`
- `isSpeechRecognitionSupported(): boolean`
- `listen(opts?: { timeoutMs?: number }): Promise<{ transcript: string; alternatives: string[] }>`
- Usa `lang = 'en-US'`, `interimResults = false`, `maxAlternatives = 3`. Usa la alternativa que mejor puntúe contra el texto esperado.
- Maneja errores con mensajes en español: permiso denegado, no se detectó voz, sin conexión.

### UI de `SpeakRepeat`
1. Muestra la frase en inglés y su traducción en gris.
2. Botones: 🔊 Escuchar, 🐢 Lento y 🎤 Hablar (grande, con animación de pulso mientras escucha).
3. Al terminar muestra el puntaje, las palabras resaltadas y "Intentar de nuevo" (hasta 3 intentos) o "Continuar".
4. Si no hay soporte, aparece el botón "Saltar por ahora" sin penalización.

---

## 9. Adaptación y repaso espaciado

### 9.1 SM-2 (`lib/srs/sm2.ts`)

```ts
// quality: 0..5 (0-2 = falló, 3 = difícil, 4 = bien, 5 = fácil)
export function sm2(item, quality) {
  if (quality < 3) { repetitions = 0; interval = 1; }
  else {
    repetitions += 1;
    interval = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  nextReviewAt = now + interval días;
}
```

- Al completar una lección, sus `vocab` y frases de `speak_repeat` se insertan en `review_items` (upsert).
- La página `/review` muestra los ítems con `next_review_at <= now()`, hasta 15 por sesión, mezclando formatos: flashcard, escuchar y elegir, y pronunciar.
- En el inicio aparece la tarjeta **"Tienes N palabras para repasar hoy"**.

### 9.2 Registro de errores
- Cada ejercicio puede declarar `errorTags` (ej: `verb_to_be`, `pronouns`, `th_sound`, `questions_word_order`).
- Si un tag acumula **3 o más errores en los últimos 7 días**, el inicio muestra la tarjeta **"Refuerzo recomendado"**. Abre una lección generada con ejercicios de ese tag tomados de todas las unidades ya desbloqueadas.

### 9.3 Durante la lección
- Los ejercicios fallados se **reinsertan al final** de la lección (máximo una vez cada uno).
- No hay vidas ni corazones (hobby, sin presión). Solo cuenta el % de aciertos.

---

## 10. Gamificación

### XP (`lib/gamification/xp.ts`)
- Ejercicio correcto: +10. Pronunciación ≥ 90: +5 extra.
- Lección completada: +20. Lección perfecta (100%): +10 extra.
- Sesión de repaso completada: +15.

### Racha (`lib/gamification/streak.ts`)
- Un día cuenta si se completa al menos una lección o repaso.
- **1 día de descanso gratis por semana**: no rompe la racha.
- Si se pierde la racha, el mensaje es positivo: *"¡Bienvenido de vuelta, Padre! Empecemos una nueva racha."*

### Meta diaria
- Anillo de progreso con los minutos estudiados frente a la meta (5, 10, 15 o 20 minutos).

### Logros (`lib/gamification/achievements.ts`)

| id | Nombre | Condición |
|---|---|---|
| `first_lesson` | Primer paso | Completar la primera lección |
| `first_unit` | Unidad conquistada | Completar la unidad 1 |
| `streak_3` | Constante | Racha de 3 días |
| `streak_7` | Una semana en inglés | Racha de 7 días |
| `streak_30` | Disciplina | Racha de 30 días |
| `words_50` | Vocabulario inicial | 50 palabras en repaso |
| `words_100` | Cien palabras | 100 palabras en repaso |
| `perfect_speak` | Buena pronunciación | Puntaje 100 en `speak_repeat` |
| `speak_50` | Hablador | 50 ejercicios de pronunciación correctos |
| `perfect_lesson` | Sin errores | Una lección al 100% |
| `first_dialogue` | Primera conversación | Completar un diálogo |
| `a1_complete` | Nivel A1 | Completar todas las unidades A1 |

Al desbloquear un logro aparece un toast animado y queda listado en `/achievements` (los bloqueados se ven en gris con su condición).

---

## 11. UI / UX

### Pantallas
1. **Inicio:** saludo con su nombre, racha, anillo de meta y XP. Debajo, tarjetas de "Repasar hoy" y "Refuerzo" (si aplican) y el **camino de unidades** con nodos de lección (bloqueado, disponible, completado).
2. **Lección:** barra de progreso arriba, ejercicio centrado y botón "Comprobar" fijo abajo. El panel de feedback sube desde abajo en verde (acierto) o naranja (error, con la respuesta correcta y 🔊).
3. **Fin de lección:** XP ganado, % de aciertos, logros nuevos y botón "Continuar".
4. **Progreso:** palabras aprendidas, minutos totales, gráfico de los últimos 14 días y barras por habilidad (escuchar, hablar, vocabulario, escribir).
5. **Logros.**
6. **Ajustes:** nombre, meta diaria, velocidad de voz (con botón de prueba), prueba de micrófono y cerrar sesión.

### Navegación
- **Móvil:** barra inferior con Inicio, Repasar, Progreso, Logros y Ajustes.
- **PC (≥ 1024px):** barra lateral izquierda y contenido centrado con un máximo de 720px.

### Estilo
- Paleta cálida y amigable. Primario azul confiable, acierto verde y error **naranja** (no rojo agresivo).
- Tipografía: `Nunito` o `Lexend` (Google Fonts), base de 18px.
- Modo claro por defecto y modo oscuro opcional.
- Sonidos cortos de acierto, error y lección completa, con opción de silenciarlos.
- Accesibilidad: `aria-label` en todos los botones de ícono, foco visible y animaciones que respetan `prefers-reduced-motion`.

---

## 12. Fases de construcción (ejecutar en orden)

### Fase 0 — Setup
```powershell
npx create-next-app@latest english-path --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd english-path
npm install @supabase/supabase-js @supabase/ssr zod zustand framer-motion
npm install @serwist/next
npm install -D serwist
```
- Crear **toda la estructura de carpetas** de la sección 3, con archivos vacíos o placeholder.
- Crear `.env.local.example`, `lib/config.ts` y `CLAUDE.md` (resumen de este documento).
- ✅ **Criterio:** `npm run dev` levanta sin errores.

### Fase 1 — Base de datos y auth
- Escribir `supabase/migrations/0001_init.sql` (sección 5).
- Clientes Supabase (`client.ts`, `server.ts`, `middleware.ts`).
- Login con enlace mágico, callback y protección de rutas.
- Onboarding (nombre, meta, prueba de audio).
- ✅ **Criterio:** el usuario inicia sesión y se crea su `profile`.

### Fase 2 — Contenido y motor de lección
- `schema.ts` (Zod) y `loader.ts`.
- `content/a1/unit-01.json` completo (sección 13).
- `lib/speech/*`, `lib/grading.ts` y `stores/lessonStore.ts`.
- Los 9 componentes de ejercicio y `ExerciseRenderer`.
- Página de lección con feedback, reinserción de fallos y pantalla final.
- Guardar `attempts` y `lesson_progress`, y desbloquear la siguiente lección.
- ✅ **Criterio:** se completa la unidad 1 de punta a punta en Chrome Android y PC.

### Fase 3 — Gamificación y adaptación
- XP, racha (con día de descanso), meta diaria y logros.
- SM-2, página `/review` y tarjeta de refuerzo por `errorTags`.
- Páginas de progreso y logros.
- ✅ **Criterio:** los logros se desbloquean, la racha funciona y aparecen repasos al día siguiente.

### Fase 4 — PWA y despliegue
- Manifest (nombre, colores, íconos y `display: standalone`) y service worker con Serwist (caché de assets y del contenido JSON).
- Deploy en Vercel con las variables de entorno.
- ✅ **Criterio:** se instala en Android desde Chrome ("Agregar a pantalla principal") y abre como app.

### Fase 5 — Tutor IA (posterior)
- `app/api/tutor/route.ts` con la API de Claude. Un personaje conversa con el usuario **a su nivel actual**, usando el vocabulario de las unidades que completó. Responde corto, corrige con amabilidad en español y propone la siguiente frase.
- Corrección de `translate` con respuestas libres.
- Generador de ejercicios de refuerzo según los `errorTags` (con validación Zod antes de mostrarse).

### Fase 6 — Contenido
- Unidades 2 a 10 de A1 (sección 13) y luego A2.

---

## 13. Contenido

### 13.1 Ruta A1 (enfoque comunicativo)

| # | Unidad | Objetivo comunicativo |
|---|---|---|
| 1 | Saludar y despedirse | Hello, good morning, how are you, goodbye |
| 2 | Presentarse | My name is…, I am from…, I am a priest |
| 3 | Números, edad y teléfono | 0–100, how old are you, my number is |
| 4 | Familia y comunidad | mother, brother, friend, community, people |
| 5 | Mi día | Rutinas, horas, días de la semana |
| 6 | Gustos | I like / I don't like: comida, música, pasatiempos |
| 7 | La ciudad | Lugares, there is/are, direcciones simples |
| 8 | En el restaurante o tienda | I would like…, how much is…, please, thank you |
| 9 | Pedir ayuda | Can you help me?, I don't understand, repeat please |
| 10 | Repaso y conversación | Checkpoint de A1-1 |

Cada unidad tiene 5 lecciones: `learn` (vocabulario) → `learn` (frases) → `practice` → `dialogue` → `checkpoint`.

### 13.2 Unidad 1 completa — `content/a1/unit-01.json`

```json
{
  "id": "a1-u01",
  "level": "A1",
  "order": 1,
  "title": "Saludar y despedirse",
  "titleEn": "Greetings",
  "icon": "👋",
  "lessons": [
    {
      "id": "a1-u01-l01",
      "title": "Primeros saludos",
      "type": "learn",
      "vocab": [
        { "key": "vocab:hello", "en": "Hello", "es": "Hola" },
        { "key": "vocab:hi", "en": "Hi", "es": "Hola (informal)" },
        { "key": "vocab:good-morning", "en": "Good morning", "es": "Buenos días" },
        { "key": "vocab:good-afternoon", "en": "Good afternoon", "es": "Buenas tardes" },
        { "key": "vocab:good-evening", "en": "Good evening", "es": "Buenas noches (al llegar)" },
        { "key": "vocab:goodbye", "en": "Goodbye", "es": "Adiós" }
      ],
      "exercises": [
        { "id": "e1", "type": "flashcard", "skill": "vocabulary", "en": "Hello", "es": "Hola" },
        { "id": "e2", "type": "flashcard", "skill": "vocabulary", "en": "Good morning", "es": "Buenos días" },
        { "id": "e3", "type": "speak_repeat", "skill": "speaking", "text": "Hello", "es": "Hola", "minScore": 70 },
        { "id": "e4", "type": "listen_choose", "skill": "listening", "audio": "Good morning", "options": ["Buenos días", "Buenas tardes", "Adiós"], "answer": "Buenos días" },
        { "id": "e5", "type": "flashcard", "skill": "vocabulary", "en": "Good afternoon", "es": "Buenas tardes" },
        { "id": "e6", "type": "flashcard", "skill": "vocabulary", "en": "Goodbye", "es": "Adiós" },
        { "id": "e7", "type": "match_pairs", "skill": "vocabulary", "pairs": [["Hello", "Hola"], ["Good morning", "Buenos días"], ["Good afternoon", "Buenas tardes"], ["Goodbye", "Adiós"]] },
        { "id": "e8", "type": "speak_repeat", "skill": "speaking", "text": "Good morning", "es": "Buenos días", "minScore": 70 },
        { "id": "e9", "type": "listen_choose", "skill": "listening", "audio": "Goodbye", "options": ["Hola", "Adiós", "Buenas noches"], "answer": "Adiós" }
      ]
    },
    {
      "id": "a1-u01-l02",
      "title": "¿Cómo estás?",
      "type": "learn",
      "grammarTip": { "es": "En inglés, la pregunta \"¿Cómo estás?\" siempre lleva el verbo \"are\": How ARE you?", "example": "How are you? — I am fine, thank you." },
      "vocab": [
        { "key": "phrase:how-are-you", "en": "How are you?", "es": "¿Cómo estás?" },
        { "key": "phrase:im-fine", "en": "I am fine", "es": "Estoy bien" },
        { "key": "vocab:thank-you", "en": "Thank you", "es": "Gracias" },
        { "key": "phrase:and-you", "en": "And you?", "es": "¿Y tú?" },
        { "key": "vocab:very-well", "en": "Very well", "es": "Muy bien" }
      ],
      "exercises": [
        { "id": "e1", "type": "flashcard", "skill": "vocabulary", "en": "How are you?", "es": "¿Cómo estás?" },
        { "id": "e2", "type": "speak_repeat", "skill": "speaking", "text": "How are you?", "es": "¿Cómo estás?", "minScore": 70 },
        { "id": "e3", "type": "flashcard", "skill": "vocabulary", "en": "I am fine, thank you", "es": "Estoy bien, gracias" },
        { "id": "e4", "type": "word_order", "skill": "writing", "es": "¿Cómo estás?", "words": ["are", "How", "you", "?"], "answer": "How are you ?", "errorTags": ["verb_to_be", "questions_word_order"] },
        { "id": "e5", "type": "listen_choose", "skill": "listening", "audio": "I am fine, thank you", "options": ["Estoy bien, gracias", "¿Y tú?", "Buenos días"], "answer": "Estoy bien, gracias" },
        { "id": "e6", "type": "fill_blank", "skill": "writing", "sentence": "How ___ you?", "options": ["are", "is", "am"], "answer": "are", "errorTags": ["verb_to_be"] },
        { "id": "e7", "type": "speak_repeat", "skill": "speaking", "text": "I am fine, thank you", "es": "Estoy bien, gracias", "minScore": 70, "errorTags": ["th_sound"] },
        { "id": "e8", "type": "listen_type", "skill": "listening", "audio": "Thank you", "answer": "thank you", "accept": ["thankyou"] },
        { "id": "e9", "type": "translate", "skill": "writing", "es": "¿Y tú?", "answer": "and you", "accept": ["and you?"] }
      ]
    },
    {
      "id": "a1-u01-l03",
      "title": "Práctica",
      "type": "practice",
      "exercises": [
        { "id": "e1", "type": "listen_choose", "skill": "listening", "audio": "Good afternoon", "options": ["Buenas tardes", "Buenos días", "Hola"], "answer": "Buenas tardes" },
        { "id": "e2", "type": "word_order", "skill": "writing", "es": "Estoy bien, gracias", "words": ["fine", "I", "thank", "am", "you"], "answer": "I am fine thank you", "errorTags": ["verb_to_be"] },
        { "id": "e3", "type": "speak_repeat", "skill": "speaking", "text": "Good afternoon", "es": "Buenas tardes", "minScore": 70 },
        { "id": "e4", "type": "fill_blank", "skill": "writing", "sentence": "I ___ fine.", "options": ["am", "are", "is"], "answer": "am", "errorTags": ["verb_to_be"] },
        { "id": "e5", "type": "listen_type", "skill": "listening", "audio": "Hello, how are you?", "answer": "hello how are you" },
        { "id": "e6", "type": "translate", "skill": "writing", "es": "Buenos días", "answer": "good morning" },
        { "id": "e7", "type": "match_pairs", "skill": "vocabulary", "pairs": [["Thank you", "Gracias"], ["And you?", "¿Y tú?"], ["Very well", "Muy bien"], ["Goodbye", "Adiós"]] },
        { "id": "e8", "type": "speak_repeat", "skill": "speaking", "text": "Very well, and you?", "es": "Muy bien, ¿y tú?", "minScore": 70 }
      ]
    },
    {
      "id": "a1-u01-l04",
      "title": "Mi primera conversación",
      "type": "dialogue",
      "exercises": [
        {
          "id": "e1",
          "type": "dialogue",
          "skill": "speaking",
          "lines": [
            { "speaker": "Anna", "en": "Good morning!", "es": "¡Buenos días!", "userTurn": false },
            { "speaker": "Tú", "en": "Good morning!", "es": "¡Buenos días!", "userTurn": true },
            { "speaker": "Anna", "en": "How are you?", "es": "¿Cómo estás?", "userTurn": false },
            { "speaker": "Tú", "en": "I am fine, thank you. And you?", "es": "Estoy bien, gracias. ¿Y tú?", "userTurn": true },
            { "speaker": "Anna", "en": "Very well, thank you!", "es": "¡Muy bien, gracias!", "userTurn": false },
            { "speaker": "Tú", "en": "Goodbye!", "es": "¡Adiós!", "userTurn": true },
            { "speaker": "Anna", "en": "Goodbye! See you soon.", "es": "¡Adiós! Nos vemos pronto.", "userTurn": false }
          ]
        }
      ]
    },
    {
      "id": "a1-u01-l05",
      "title": "Prueba de la unidad",
      "type": "checkpoint",
      "exercises": [
        { "id": "e1", "type": "listen_choose", "skill": "listening", "audio": "How are you?", "options": ["¿Cómo estás?", "¿Y tú?", "Gracias"], "answer": "¿Cómo estás?" },
        { "id": "e2", "type": "listen_type", "skill": "listening", "audio": "Good evening", "answer": "good evening" },
        { "id": "e3", "type": "speak_repeat", "skill": "speaking", "text": "Hello, good morning", "es": "Hola, buenos días", "minScore": 70 },
        { "id": "e4", "type": "fill_blank", "skill": "writing", "sentence": "How are ___?", "options": ["you", "I", "fine"], "answer": "you" },
        { "id": "e5", "type": "translate", "skill": "writing", "es": "Estoy bien, gracias", "answer": "i am fine thank you", "accept": ["i'm fine thank you", "i am fine thanks"] },
        { "id": "e6", "type": "word_order", "skill": "writing", "es": "Muy bien, ¿y tú?", "words": ["you", "well", "Very", "and", "?"], "answer": "Very well and you ?" },
        { "id": "e7", "type": "speak_repeat", "skill": "speaking", "text": "Thank you, goodbye", "es": "Gracias, adiós", "minScore": 70, "errorTags": ["th_sound"] },
        { "id": "e8", "type": "listen_choose", "skill": "listening", "audio": "See you soon", "options": ["Nos vemos pronto", "Buenas tardes", "Muy bien"], "answer": "Nos vemos pronto" }
      ]
    }
  ]
}
```

> **Checkpoint:** para completar la unidad se requiere ≥ 70% de aciertos. Si no se alcanza: *"¡Casi! Repasemos un poco y lo intentas de nuevo."*

---

## 14. Reglas de código

- TypeScript estricto, sin `any`.
- Server Components por defecto. `'use client'` solo en componentes interactivos (ejercicios, voz).
- Todo el contenido JSON se valida con Zod al cargarse. Si falla, se lanza un error claro en desarrollo.
- Los textos de la interfaz van en español, centralizados en `lib/config.ts` o en un objeto `ui-strings`.
- Componentes pequeños y reutilizables. Nada de lógica de negocio en los componentes de UI (va en `lib/`).
- Manejo de errores amigable: nunca mostrar trazas al usuario.
- Probar cada fase en un viewport de 360px (Android) y de 1440px (PC).

---

## 15. Definición de terminado (MVP = Fases 0–4)

- [ ] El Padre Victor entra por un link e inicia sesión con su correo.
- [ ] Ve su camino de unidades, su racha, su XP y su meta diaria.
- [ ] Completa la unidad 1 con ejercicios de escuchar, hablar, escribir y vocabulario.
- [ ] La pronunciación funciona en Chrome Android y PC, con puntaje y palabras resaltadas.
- [ ] Su progreso se guarda y continúa en cualquier dispositivo.
- [ ] Aparecen repasos espaciados de lo aprendido.
- [ ] Desbloquea logros con animación.
- [ ] La app se instala en Android como PWA.
- [ ] Está desplegada en Vercel.
