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
  genericError: "Algo salió mal. Intenta de nuevo en un momento.",
  signOut: "Cerrar sesión",
  login: {
    title: "¡Bienvenido!",
    subtitle: "Escribe tu correo y te enviamos un enlace para entrar. Sin contraseñas.",
    emailLabel: "Tu correo electrónico",
    emailPlaceholder: "tucorreo@ejemplo.com",
    submit: "Enviarme el enlace",
    sending: "Enviando…",
    sentTitle: "¡Revisa tu correo!",
    sentBody: (email: string) =>
      `Te enviamos un enlace a ${email}. Ábrelo desde este mismo dispositivo y toca "Iniciar sesión".`,
    sentHint: "Si no lo ves en unos minutos, revisa la carpeta de spam o correo no deseado.",
    useOtherEmail: "Usar otro correo",
    invalidEmail: "Revisa el correo, parece que le falta algo.",
    rateLimited: "Ya te enviamos un enlace hace poco. Espera un minuto antes de pedir otro.",
    linkError: "El enlace no funcionó o ya venció. Pide uno nuevo, no pasa nada.",
  },
  onboarding: {
    stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
    next: "Siguiente",
    back: "Atrás",
    finish: "¡Empezar!",
    saving: "Guardando…",
    invalid: "Revisa tu nombre y tu meta diaria.",
    nameTitle: "¿Cómo te llamas?",
    nameHint: "Así te saludaremos cada día.",
    namePlaceholder: "Ej: Padre Victor",
    goalTitle: "¿Cuánto quieres practicar al día?",
    goalHint: "Puedes cambiarlo cuando quieras. Lo importante es la constancia.",
    goalLabels: { 5: "Tranquilo", 10: "Normal", 15: "Dedicado", 20: "Intenso" },
    minutes: (n: number) => `${n} minutos`,
    audioTitle: "Probemos el audio y el micrófono",
    audioHint: "Sube el volumen. Vas a escuchar una frase en inglés.",
    audioPhrase: "Hello! Welcome to English Path.",
    audioButton: "Escuchar",
    micHint: 'Ahora toca el micrófono y di en voz alta: "Hello"',
    micExpected: "Hello",
    micButton: "Probar micrófono",
    micListening: "Te escucho…",
    micHeard: (text: string) => `Te escuché decir: "${text}". ¡Funciona!`,
    skipHint: "Si algo no funciona, no te preocupes: puedes empezar igual.",
  },
  speechErrors: {
    "not-supported": "Para practicar pronunciación abre la app en Google Chrome",
    "not-allowed":
      "Necesito permiso para usar el micrófono. Toca el candado junto a la dirección y elige Permitir.",
    "no-speech": "No te escuché. Intenta de nuevo hablando un poco más fuerte.",
    network: "Parece que no hay internet. El micrófono la necesita para entenderte.",
    "audio-capture": "No encontré un micrófono en este dispositivo.",
    unknown: "Algo salió mal con el micrófono. Intenta de nuevo.",
  },
  nav: {
    home: "Inicio",
    review: "Repasar",
    progress: "Progreso",
    achievements: "Logros",
    settings: "Ajustes",
  },
} as const;
