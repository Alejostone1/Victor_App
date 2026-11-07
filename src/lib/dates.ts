// Fechas "de calendario" (YYYY-MM-DD) en la zona horaria de la app.
// La racha, la meta diaria y los repasos se cuentan por día local, no por UTC.
import { APP_CONFIG } from "@/lib/config";

const TZ = APP_CONFIG.timeZone;

/** Fecha local (YYYY-MM-DD) de un instante. */
export function localDate(at: Date = new Date(), timeZone: string = TZ): string {
  return at.toLocaleDateString("en-CA", { timeZone });
}

/** Suma días a una fecha YYYY-MM-DD (aritmética en UTC, sin horas). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Días entre dos fechas YYYY-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Lunes de la semana de esa fecha (clave de semana para el día de descanso). */
export function weekStart(iso: string): string {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return addDays(iso, -((day + 6) % 7));
}

/** Desfase de la zona horaria en minutos para un instante (Bogotá = -300). */
function offsetMinutes(at: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = name?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "-" ? -minutes : minutes;
}

/** Instante en que empieza ese día local (medianoche en la zona de la app). */
export function startOfLocalDay(iso: string, timeZone: string = TZ): Date {
  const utcMidnight = new Date(`${iso}T00:00:00Z`);
  return new Date(utcMidnight.getTime() - offsetMinutes(utcMidnight, timeZone) * 60_000);
}
