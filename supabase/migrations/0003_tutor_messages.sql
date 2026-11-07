-- Fase 5: mensajes al tutor IA por día (límite diario para controlar el costo de la API).
alter table public.daily_activity
  add column if not exists tutor_messages int not null default 0;
