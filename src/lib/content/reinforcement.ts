// Lección de refuerzo generada a partir de los ejercicios de un `errorTag` (sección 9.2).
import { ERROR_TAG_LABELS } from "@/lib/config";
import { getAllLessons, isLessonUnlocked } from "@/lib/content/loader";
import type { Lesson } from "@/lib/content/schema";
import { seededShuffle } from "@/lib/utils";

export const REINFORCE_PREFIX = "reinforce:";
const MAX_EXERCISES = 8;

export function reinforcementLessonId(tag: string): string {
  return `${REINFORCE_PREFIX}${tag}`;
}

export function parseReinforcementId(lessonId: string): string | null {
  if (!lessonId.startsWith(REINFORCE_PREFIX)) return null;
  const tag = lessonId.slice(REINFORCE_PREFIX.length);
  return ERROR_TAG_LABELS[tag] ? tag : null;
}

/** Tags que tienen ejercicios en el contenido (para prerenderizar las rutas). */
export function getReinforcementTags(): string[] {
  const tags = new Set<string>();
  for (const { lesson } of getAllLessons()) {
    for (const ex of lesson.exercises) for (const tag of ex.errorTags ?? []) if (ERROR_TAG_LABELS[tag]) tags.add(tag);
  }
  return [...tags];
}

/**
 * Arma la lección con los ejercicios de ese tag. Con `completed`, solo usa lecciones abiertas
 * y elige hasta 8 ejercicios; sin él devuelve todos (sirve para validar al guardar).
 * Los ids se prefijan con la lección de origen para que no choquen.
 */
export function buildReinforcementLesson(tag: string, completed?: ReadonlySet<string>, seed = ""): Lesson | null {
  const label = ERROR_TAG_LABELS[tag];
  if (!label) return null;
  const exercises = getAllLessons()
    .filter(({ lesson }) => !completed || isLessonUnlocked(lesson.id, completed))
    .flatMap(({ lesson }) =>
      lesson.exercises
        .filter((ex) => ex.type !== "flashcard" && ex.type !== "dialogue" && ex.errorTags?.includes(tag))
        .map((ex) => ({ ...ex, id: `${lesson.id}:${ex.id}` })),
    );
  const chosen = completed ? seededShuffle(exercises, `${tag}:${seed}`).slice(0, MAX_EXERCISES) : exercises;
  if (chosen.length === 0) return null;
  return {
    id: reinforcementLessonId(tag),
    title: label.title,
    type: "practice",
    icon: label.icon,
    exercises: chosen,
  };
}
