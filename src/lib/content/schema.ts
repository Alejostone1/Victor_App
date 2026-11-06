import { z } from "zod";

// Esquemas del contenido (sección 7 de la especificación). Todo JSON de content/ se valida aquí.

export const skillSchema = z.enum(["listening", "speaking", "vocabulary", "writing", "reading"]);

const base = {
  id: z.string().min(1),
  skill: skillSchema,
  errorTags: z.array(z.string()).optional(),
};

const nonEmpty = z.string().trim().min(1);

export const flashcardSchema = z.object({
  ...base,
  type: z.literal("flashcard"),
  en: nonEmpty,
  es: nonEmpty,
  emoji: z.string().optional(),
  image: z.string().optional(),
});

export const listenChooseSchema = z
  .object({
    ...base,
    type: z.literal("listen_choose"),
    audio: nonEmpty,
    options: z.array(nonEmpty).min(2),
    answer: nonEmpty,
  })
  .refine((e) => e.options.includes(e.answer), { message: "answer debe estar en options" });

export const listenTypeSchema = z.object({
  ...base,
  type: z.literal("listen_type"),
  audio: nonEmpty,
  answer: nonEmpty,
  accept: z.array(nonEmpty).optional(),
});

export const speakRepeatSchema = z.object({
  ...base,
  type: z.literal("speak_repeat"),
  text: nonEmpty,
  es: nonEmpty,
  minScore: z.number().int().min(0).max(100).default(70),
});

export const wordOrderSchema = z.object({
  ...base,
  type: z.literal("word_order"),
  es: nonEmpty,
  words: z.array(nonEmpty).min(2),
  answer: nonEmpty,
});

export const fillBlankSchema = z
  .object({
    ...base,
    type: z.literal("fill_blank"),
    sentence: z.string().includes("___"),
    options: z.array(nonEmpty).min(2),
    answer: nonEmpty,
  })
  .refine((e) => e.options.includes(e.answer), { message: "answer debe estar en options" });

export const translateSchema = z.object({
  ...base,
  type: z.literal("translate"),
  es: nonEmpty,
  answer: nonEmpty,
  accept: z.array(nonEmpty).optional(),
});

export const matchPairsSchema = z.object({
  ...base,
  type: z.literal("match_pairs"),
  pairs: z.array(z.tuple([nonEmpty, nonEmpty])).min(2),
});

export const dialogueLineSchema = z.object({
  speaker: nonEmpty,
  en: nonEmpty,
  es: nonEmpty,
  userTurn: z.boolean(),
});

export const dialogueSchema = z.object({
  ...base,
  type: z.literal("dialogue"),
  lines: z.array(dialogueLineSchema).min(2),
});

export const exerciseSchema = z.discriminatedUnion("type", [
  flashcardSchema,
  listenChooseSchema,
  listenTypeSchema,
  speakRepeatSchema,
  wordOrderSchema,
  fillBlankSchema,
  translateSchema,
  matchPairsSchema,
  dialogueSchema,
]);

export const vocabItemSchema = z.object({
  key: nonEmpty,
  en: nonEmpty,
  es: nonEmpty,
  image: z.string().optional(),
});

export const lessonSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  type: z.enum(["learn", "practice", "dialogue", "checkpoint"]),
  grammarTip: z.object({ es: nonEmpty, example: nonEmpty }).optional(),
  vocab: z.array(vocabItemSchema).optional(),
  exercises: z.array(exerciseSchema).min(1),
});

export const unitSchema = z
  .object({
    id: nonEmpty,
    level: z.enum(["A1", "A2", "B1"]),
    order: z.number().int().positive(),
    title: nonEmpty,
    titleEn: nonEmpty,
    icon: nonEmpty,
    lessons: z.array(lessonSchema).min(1),
  })
  .superRefine((unit, ctx) => {
    const lessonIds = new Set<string>();
    for (const lesson of unit.lessons) {
      if (lessonIds.has(lesson.id)) {
        ctx.addIssue({ code: "custom", message: `Lección repetida: ${lesson.id}` });
      }
      lessonIds.add(lesson.id);
      const exerciseIds = new Set<string>();
      for (const ex of lesson.exercises) {
        if (exerciseIds.has(ex.id)) {
          ctx.addIssue({ code: "custom", message: `Ejercicio repetido: ${lesson.id}/${ex.id}` });
        }
        exerciseIds.add(ex.id);
      }
    }
  });

export const roadmapSchema = z.array(
  z.object({ order: z.number().int().positive(), title: nonEmpty, goal: nonEmpty, icon: nonEmpty }),
);

export type Skill = z.infer<typeof skillSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseType = Exercise["type"];
export type ExerciseOf<T extends ExerciseType> = Extract<Exercise, { type: T }>;
export type DialogueLine = z.infer<typeof dialogueLineSchema>;
export type VocabItem = z.infer<typeof vocabItemSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type RoadmapEntry = z.infer<typeof roadmapSchema>[number];
