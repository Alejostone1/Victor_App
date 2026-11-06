import { create } from "zustand";
import type { Exercise, Lesson } from "@/lib/content/schema";
import type { GradeResult } from "@/lib/grading";
import { isGraded, type AnswerRecord } from "@/lib/lesson/summary";

/** Un ejercicio en la cola. `retry` = reinsertado al final tras fallarlo (máx. una vez). */
export type QueueItem = { exercise: Exercise; retry: boolean; key: string };

export type Feedback = {
  result: GradeResult;
  /** Respuesta correcta para mostrar cuando hubo error o "casi". */
  correctAnswer?: string;
  /** Texto en inglés para el botón 🔊 del panel. */
  audio?: string;
};

export type AnswerInput = {
  isCorrect: boolean;
  score?: number | null;
  userAnswer?: string | null;
  skipped?: boolean;
  /** null = el ejercicio ya mostró su propio resultado; se avanza sin panel. */
  feedback: Feedback | null;
};

type LessonState = {
  lessonId: string | null;
  queue: QueueItem[];
  index: number;
  feedback: Feedback | null;
  answers: AnswerRecord[];
  showTip: boolean;
  finished: boolean;
  startedAt: number;
  start: (lesson: Lesson) => void;
  dismissTip: () => void;
  answer: (input: AnswerInput) => void;
  next: () => void;
};

export const useLessonStore = create<LessonState>((set, get) => ({
  lessonId: null,
  queue: [],
  index: 0,
  feedback: null,
  answers: [],
  showTip: false,
  finished: false,
  startedAt: 0,

  start: (lesson) =>
    set({
      lessonId: lesson.id,
      queue: lesson.exercises.map((exercise) => ({ exercise, retry: false, key: exercise.id })),
      index: 0,
      feedback: null,
      answers: [],
      showTip: Boolean(lesson.grammarTip),
      finished: false,
      startedAt: Date.now(),
    }),

  dismissTip: () => set({ showTip: false }),

  answer: ({ isCorrect, score = null, userAnswer = null, skipped = false, feedback }) => {
    const { queue, index, answers } = get();
    const current = queue[index];
    if (!current) return;

    const record: AnswerRecord = {
      exerciseId: current.exercise.id,
      isCorrect,
      score,
      userAnswer,
      firstTry: !current.retry,
      skipped,
    };
    // Lo fallado se repite al final de la lección, una sola vez.
    const shouldRetry = !isCorrect && !skipped && !current.retry && isGraded(current.exercise);
    const nextQueue = shouldRetry
      ? [...queue, { exercise: current.exercise, retry: true, key: `${current.exercise.id}-retry` }]
      : queue;

    set({ answers: [...answers, record], queue: nextQueue, feedback });
    if (feedback === null) get().next();
  },

  next: () => {
    const { index, queue } = get();
    const nextIndex = index + 1;
    set({ feedback: null, index: nextIndex, finished: nextIndex >= queue.length });
  },
}));
