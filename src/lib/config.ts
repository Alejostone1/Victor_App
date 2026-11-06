// Configuración central de la app y textos de la interfaz (en español).

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "EnglishPath",
  description: "Aprende inglés para comunicarte, paso a paso y sin presión.",
  studentDefaultName: "Estudiante",
  theme: {
    primary: "#2563eb",
    background: "#fffaf3",
  },
} as const;

/** Peso de cada habilidad al armar lecciones (comunicación antes que gramática). */
export const SKILL_WEIGHTS = {
  listening: 0.4,
  speaking: 0.3,
  vocabulary: 0.2,
  writing: 0.1,
} as const;

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;
export const DEFAULT_DAILY_GOAL_MINUTES = 10;

export const SPEECH_CONFIG = {
  lang: "en-US",
  normalRate: 0.9,
  slowRate: 0.6,
  defaultMinScore: 70,
  maxSpeakAttempts: 3,
} as const;

export const XP_RULES = {
  correctExercise: 10,
  pronunciationBonus: 5,
  pronunciationBonusThreshold: 90,
  lessonCompleted: 20,
  perfectLessonBonus: 10,
  reviewSessionCompleted: 15,
} as const;

export const LEARNING_RULES = {
  checkpointPassPercent: 70,
  reviewSessionMaxItems: 15,
  reinforcementErrorThreshold: 3,
  reinforcementWindowDays: 7,
  freeRestDaysPerWeek: 1,
} as const;

export const UI_STRINGS = {
  check: "Comprobar",
  continue: "Continuar",
  tryAgain: "Intentar de nuevo",
  skipForNow: "Saltar por ahora",
  listen: "Escuchar",
  slow: "Lento",
  speak: "Hablar",
  correct: "¡Muy bien!",
  almost: "Casi, revisa la ortografía",
  checkpointFailed: "¡Casi! Repasemos un poco y lo intentas de nuevo.",
  welcomeBack: (name: string) =>
    `¡Bienvenido de vuelta, ${name}! Empecemos una nueva racha.`,
  speechNotSupported: "Para practicar pronunciación abre la app en Google Chrome",
  nav: {
    home: "Inicio",
    review: "Repasar",
    progress: "Progreso",
    achievements: "Logros",
    settings: "Ajustes",
  },
} as const;
