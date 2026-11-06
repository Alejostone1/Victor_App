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
    subtitleSignIn: "Escribe tu usuario y tu contraseña para entrar.",
    subtitleSignUp: "Elige un usuario y una contraseña. Con ellos entrarás siempre.",
    usernameLabel: "Usuario",
    usernamePlaceholder: "Ej: victor",
    usernameHint: "Solo letras y números, sin espacios.",
    passwordLabel: "Contraseña",
    passwordHint: "Mínimo 6 caracteres.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    submitSignIn: "Entrar",
    submitSignUp: "Crear mi cuenta",
    working: "Un momento…",
    toSignUp: "¿Primera vez? Crear una cuenta",
    toSignIn: "Ya tengo cuenta, quiero entrar",
    usernameTooShort: "El usuario debe tener al menos 3 letras.",
    usernameTooLong: "El usuario puede tener máximo 20 caracteres.",
    usernameInvalid: "El usuario solo puede tener letras sin tilde, números, punto o guion. Sin espacios.",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres.",
    passwordTooLong: "La contraseña es demasiado larga.",
    wrongCredentials: "Usuario o contraseña incorrectos. Revísalos e intenta de nuevo.",
    usernameTaken: "Ese usuario ya existe. Elige otro o entra con tu contraseña.",
    rateLimited: "Hubo muchos intentos seguidos. Espera un minuto y vuelve a intentar.",
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
