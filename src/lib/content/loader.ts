import type { z } from "zod";
import roadmapJson from "../../../content/a1/roadmap.json";
import unit01Json from "../../../content/a1/unit-01.json";
import { roadmapSchema, unitSchema, type Lesson, type RoadmapEntry, type Unit } from "./schema";

// Para agregar una unidad: importa su JSON y súmalo a RAW_UNITS.
const RAW_UNITS: unknown[] = [unit01Json];

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Contenido inválido en ${label}:\n${details}`);
  }
  return result.data;
}

// Se valida una sola vez al cargar el módulo: un JSON roto falla con un error claro.
const UNITS: readonly Unit[] = RAW_UNITS.map((raw, i) => parseOrThrow(unitSchema, raw, `unidad #${i + 1}`)).sort(
  (a, b) => a.order - b.order,
);
const ROADMAP: readonly RoadmapEntry[] = parseOrThrow(roadmapSchema, roadmapJson, "content/a1/roadmap.json");

export type LessonRef = { lesson: Lesson; unit: Unit; index: number };

/** Todas las lecciones en orden de ruta (unidad, luego lección). */
const LESSON_ORDER: readonly LessonRef[] = UNITS.flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit }))).map(
  (ref, index) => ({ ...ref, index }),
);

export function getUnits(): readonly Unit[] {
  return UNITS;
}

export function getUnit(unitId: string): Unit | undefined {
  return UNITS.find((u) => u.id === unitId);
}

export function getLessonRef(lessonId: string): LessonRef | undefined {
  return LESSON_ORDER.find((ref) => ref.lesson.id === lessonId);
}

export function getAllLessons(): readonly LessonRef[] {
  return LESSON_ORDER;
}

export function getNextLesson(lessonId: string): LessonRef | undefined {
  const ref = getLessonRef(lessonId);
  return ref ? LESSON_ORDER[ref.index + 1] : undefined;
}

/** Una lección está disponible si es la primera o si la anterior ya está completada. */
export function isLessonUnlocked(lessonId: string, completed: ReadonlySet<string>): boolean {
  const ref = getLessonRef(lessonId);
  if (!ref) return false;
  if (ref.index === 0 || completed.has(lessonId)) return true;
  const previous = LESSON_ORDER[ref.index - 1];
  return previous !== undefined && completed.has(previous.lesson.id);
}

/** Unidades de la ruta A1 que todavía no tienen contenido. */
export function getUpcomingUnits(): readonly RoadmapEntry[] {
  const existing = new Set(UNITS.map((u) => u.order));
  return ROADMAP.filter((entry) => !existing.has(entry.order));
}
