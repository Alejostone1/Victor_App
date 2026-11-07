import type { z } from "zod";
import roadmapJson from "../../../content/a1/roadmap.json";
import unit01Json from "../../../content/a1/unit-01.json";
import unit02Json from "../../../content/a1/unit-02.json";
import unit03Json from "../../../content/a1/unit-03.json";
import unit04Json from "../../../content/a1/unit-04.json";
import unit05Json from "../../../content/a1/unit-05.json";
import unit06Json from "../../../content/a1/unit-06.json";
import unit07Json from "../../../content/a1/unit-07.json";
import unit08Json from "../../../content/a1/unit-08.json";
import unit09Json from "../../../content/a1/unit-09.json";
import unit10Json from "../../../content/a1/unit-10.json";
import unit11Json from "../../../content/a1/unit-11.json";
import unit12Json from "../../../content/a1/unit-12.json";
import { roadmapSchema, unitSchema, type Lesson, type Roadmap, type RoadmapEntry, type Stage, type Unit } from "./schema";

// Para agregar una unidad: importa su JSON y súmalo a RAW_UNITS.
const RAW_UNITS: unknown[] = [
  unit01Json, unit02Json, unit03Json, unit04Json, unit05Json, unit06Json, unit07Json,
  unit08Json, unit09Json, unit10Json, unit11Json, unit12Json,
];

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
const ROADMAP: Roadmap = parseOrThrow(roadmapSchema, roadmapJson, "content/a1/roadmap.json");

// Cada unidad con contenido debe tener su lugar (número de orden) en la ruta, y sin repetirse.
{
  const orders = new Set(ROADMAP.units.map((u) => u.order));
  const seen = new Set<number>();
  for (const unit of UNITS) {
    if (!orders.has(unit.order)) throw new Error(`La unidad ${unit.id} tiene order ${unit.order}, que no está en roadmap.json`);
    if (seen.has(unit.order)) throw new Error(`Dos unidades tienen order ${unit.order}`);
    seen.add(unit.order);
  }
}

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

/**
 * Cada tema se puede empezar cuando se quiera: la primera lección de cada unidad está abierta.
 * Dentro de la unidad, una lección se abre al completar la anterior.
 */
export function isLessonUnlocked(lessonId: string, completed: ReadonlySet<string>): boolean {
  const ref = getLessonRef(lessonId);
  if (!ref) return false;
  if (completed.has(lessonId)) return true;
  const position = ref.unit.lessons.findIndex((l) => l.id === lessonId);
  if (position <= 0) return true;
  return completed.has(ref.unit.lessons[position - 1].id);
}

/** Primera lección sin completar de la unidad (o undefined si la terminó). */
export function getNextLessonInUnit(unit: Unit, completed: ReadonlySet<string>): Lesson | undefined {
  return unit.lessons.find((l) => !completed.has(l.id));
}

/**
 * Lección para el botón "Continuar": sigue en la unidad de la última lección terminada;
 * si esa unidad ya está completa (o no hay historial), la primera pendiente en orden.
 */
export function getContinueLesson(completed: ReadonlySet<string>, lastLessonId: string | null): LessonRef | undefined {
  const last = lastLessonId ? getLessonRef(lastLessonId) : undefined;
  if (last) {
    const next = getNextLessonInUnit(last.unit, completed);
    if (next) return getLessonRef(next.id);
  }
  return LESSON_ORDER.find(({ lesson }) => !completed.has(lesson.id));
}

/** Números de unidad de toda la ruta A1 (con o sin contenido). */
export function getRoadmapOrders(): number[] {
  return ROADMAP.units.map((entry) => entry.order);
}

export type StageGroup = {
  stage: Stage;
  /** Unidades de la etapa en orden: con contenido (`unit`) o "muy pronto". */
  items: Array<{ entry: RoadmapEntry; unit: Unit | undefined }>;
};

/** Etapas de la ruta con sus unidades, en el orden recomendado de aprendizaje. */
export function getStages(): StageGroup[] {
  return ROADMAP.stages.map((stage) => ({
    stage,
    items: ROADMAP.units
      .filter((entry) => entry.stage === stage.id)
      .sort((a, b) => a.order - b.order)
      .map((entry) => ({ entry, unit: UNITS.find((u) => u.order === entry.order) })),
  }));
}

/** Etapa a la que pertenece una unidad. */
export function getStageOf(unit: Unit): Stage | undefined {
  const entry = ROADMAP.units.find((e) => e.order === unit.order);
  return entry ? ROADMAP.stages.find((s) => s.id === entry.stage) : undefined;
}

/** Unidades de la ruta A1 que todavía no tienen contenido. */
export function getUpcomingUnits(): readonly RoadmapEntry[] {
  const existing = new Set(UNITS.map((u) => u.order));
  return ROADMAP.units.filter((entry) => !existing.has(entry.order));
}
