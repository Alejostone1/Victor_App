// Logros (sección 10). Definidos en código; la BD solo guarda cuáles se desbloquearon.

export type AchievementStats = {
  lessonsCompleted: number;
  unitsCompleted: number;
  allA1Completed: boolean;
  streak: number;
  words: number;
  perfectSpeak: boolean;
  speakCorrect: number;
  perfectLesson: boolean;
  dialoguesCompleted: number;
  reviewSessions: number;
};

export type Achievement = {
  id: string;
  name: string;
  /** Condición, en español, para mostrarla cuando está bloqueado. */
  condition: string;
  icon: string;
  test: (s: AchievementStats) => boolean;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first_lesson", name: "Primer paso", condition: "Completa tu primera lección", icon: "👣", test: (s) => s.lessonsCompleted >= 1 },
  { id: "first_unit", name: "Unidad conquistada", condition: "Completa un tema entero", icon: "🥇", test: (s) => s.unitsCompleted >= 1 },
  { id: "first_dialogue", name: "Primera conversación", condition: "Completa una conversación", icon: "💬", test: (s) => s.dialoguesCompleted >= 1 },
  { id: "perfect_lesson", name: "Sin errores", condition: "Haz una lección al 100 %", icon: "💯", test: (s) => s.perfectLesson },
  { id: "first_review", name: "Buena memoria", condition: "Termina tu primer repaso", icon: "🧠", test: (s) => s.reviewSessions >= 1 },
  { id: "streak_3", name: "Constante", condition: "Practica 3 días seguidos", icon: "🔥", test: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Una semana en inglés", condition: "Racha de 7 días", icon: "📅", test: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Disciplina", condition: "Racha de 30 días", icon: "🏅", test: (s) => s.streak >= 30 },
  { id: "words_50", name: "Vocabulario inicial", condition: "Aprende 50 palabras", icon: "📚", test: (s) => s.words >= 50 },
  { id: "words_100", name: "Cien palabras", condition: "Aprende 100 palabras", icon: "📖", test: (s) => s.words >= 100 },
  { id: "perfect_speak", name: "Buena pronunciación", condition: "Saca 100 al pronunciar", icon: "🎤", test: (s) => s.perfectSpeak },
  { id: "speak_50", name: "Hablador", condition: "Pronuncia bien 50 veces", icon: "🗣️", test: (s) => s.speakCorrect >= 50 },
  { id: "a1_complete", name: "Nivel A1", condition: "Completa todos los temas del nivel A1", icon: "🏆", test: (s) => s.allA1Completed },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Logros que se cumplen con estas estadísticas. */
export function earnedAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.test(stats)).map((a) => a.id);
}

/** Lo que se le envía al cliente (sin la función de prueba). */
export type AchievementView = Pick<Achievement, "id" | "name" | "condition" | "icon">;

export function toView(a: Achievement): AchievementView {
  return { id: a.id, name: a.name, condition: a.condition, icon: a.icon };
}
