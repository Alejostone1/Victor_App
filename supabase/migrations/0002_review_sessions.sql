-- Fase 3: sesiones de repaso por día (cuentan para la racha y el logro "Buena memoria").
alter table public.daily_activity
  add column if not exists reviews_completed int not null default 0;

-- Consultas de repaso pendiente por usuario (ya existe review_items(user_id, next_review_at)).
-- Errores recientes por usuario para la tarjeta de refuerzo (ya existe attempts(user_id, created_at desc)).
