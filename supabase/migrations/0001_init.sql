-- EnglishPath — esquema inicial (sección 5 de docs/prompt-maestro-plataforma-ingles.md)
-- El contenido (unidades, lecciones, ejercicios) vive en content/*.json.
-- La BD solo guarda progreso y datos del usuario. RLS activo en todas las tablas.

-- Perfil del usuario (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Estudiante',
  daily_goal_minutes int not null default 10 check (daily_goal_minutes in (5,10,15,20)),
  voice_rate numeric not null default 0.9,
  total_xp int not null default 0,
  current_level text not null default 'A1',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Progreso por lección
create table public.lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,            -- ej: 'a1-u01-l01'
  unit_id text not null,              -- ej: 'a1-u01'
  status text not null default 'locked' check (status in ('locked','available','completed')),
  best_score int not null default 0 check (best_score between 0 and 100),
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
  score int check (score between 0 and 100),   -- pronunciación
  user_answer text,
  error_tags text[] not null default '{}',     -- ej: {'verb_to_be','th_sound'}
  created_at timestamptz not null default now()
);
create index attempts_user_created_idx on public.attempts (user_id, created_at desc);

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
create index review_items_due_idx on public.review_items (user_id, next_review_at);

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

-- Logros desbloqueados (definidos en src/lib/gamification/achievements.ts)
create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
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

-- (select auth.uid()) se evalúa una vez por consulta (recomendación de rendimiento de Supabase).
create policy "own profile" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own progress" on public.lesson_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own attempts" on public.attempts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own reviews" on public.review_items for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own activity" on public.daily_activity for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own achievements" on public.user_achievements for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Crear perfil automáticamente al registrarse
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Estudiante'));
  return new;
end; $$;

-- Solo la usa el trigger; no debe poder llamarse por la API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();
