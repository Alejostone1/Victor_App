import type { ExerciseOf, ExerciseType } from "@/lib/content/schema";
import type { AnswerInput } from "@/stores/lessonStore";

export type ExerciseProps<T extends ExerciseType> = {
  exercise: ExerciseOf<T>;
  /** Semilla para mezclar opciones de forma estable (cambia en el repaso). */
  seed: string;
  /** Es un ejercicio repetido al final de la lección. */
  retry: boolean;
  /** true mientras se muestra el panel de resultado: no se puede cambiar la respuesta. */
  locked: boolean;
  onAnswer: (input: AnswerInput) => void;
};
