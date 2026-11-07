// Tableros de "Explorar": material de consulta para tocar y escuchar (sin calificación).
// `say` es lo que pronuncia la voz; `hint` es cómo suena escrito para hispanohablantes.

export type BoardTile = {
  id: string;
  /** Lo que se ve grande: letra, número o nombre del color. */
  label: string;
  say: string;
  hint: string;
  es: string;
  /** Palabra de ejemplo (abecedario). */
  example?: { en: string; emoji: string; es: string };
  color?: string;
};

export type Board = {
  id: "alphabet" | "numbers" | "colors";
  title: string;
  titleEn: string;
  icon: string;
  color: string;
  hint: string;
  tiles: readonly BoardTile[];
};

const LETTERS: Array<[string, string, string, string, string, string]> = [
  ["A", "A", "éi", "Apple", "🍎", "manzana"],
  ["B", "bee", "bi", "Ball", "⚽", "pelota"],
  ["C", "see", "si", "Cat", "🐱", "gato"],
  ["D", "dee", "di", "Dog", "🐶", "perro"],
  ["E", "E", "i", "Egg", "🥚", "huevo"],
  ["F", "ef", "ef", "Fish", "🐟", "pez"],
  ["G", "gee", "yi", "Guitar", "🎸", "guitarra"],
  ["H", "aitch", "éich", "House", "🏠", "casa"],
  ["I", "I", "ái", "Ice cream", "🍦", "helado"],
  ["J", "jay", "yéi", "Juice", "🧃", "jugo"],
  ["K", "kay", "kéi", "Key", "🔑", "llave"],
  ["L", "el", "el", "Lion", "🦁", "león"],
  ["M", "em", "em", "Moon", "🌙", "luna"],
  ["N", "en", "en", "Nose", "👃", "nariz"],
  ["O", "oh", "óu", "Orange", "🍊", "naranja"],
  ["P", "pee", "pi", "Pizza", "🍕", "pizza"],
  ["Q", "cue", "kiú", "Queen", "👑", "reina"],
  ["R", "are", "ar", "Rain", "🌧️", "lluvia"],
  ["S", "ess", "es", "Sun", "☀️", "sol"],
  ["T", "tee", "ti", "Tree", "🌳", "árbol"],
  ["U", "you", "iú", "Umbrella", "☂️", "paraguas"],
  ["V", "vee", "vi", "Violin", "🎻", "violín"],
  ["W", "double you", "dábel iú", "Water", "💧", "agua"],
  ["X", "ex", "eks", "Box", "📦", "caja"],
  ["Y", "why", "uái", "Yellow", "💛", "amarillo"],
  ["Z", "zee", "zi", "Zebra", "🦓", "cebra"],
];

const NUMBERS: Array<[number, string, string, string]> = [
  [0, "zero", "zírou", "cero"],
  [1, "one", "uán", "uno"],
  [2, "two", "tú", "dos"],
  [3, "three", "zrí", "tres"],
  [4, "four", "for", "cuatro"],
  [5, "five", "fáiv", "cinco"],
  [6, "six", "siks", "seis"],
  [7, "seven", "séven", "siete"],
  [8, "eight", "éit", "ocho"],
  [9, "nine", "náin", "nueve"],
  [10, "ten", "ten", "diez"],
  [11, "eleven", "iléven", "once"],
  [12, "twelve", "tuélv", "doce"],
  [13, "thirteen", "zertín", "trece"],
  [14, "fourteen", "fortín", "catorce"],
  [15, "fifteen", "fiftín", "quince"],
  [16, "sixteen", "sikstín", "dieciséis"],
  [17, "seventeen", "seventín", "diecisiete"],
  [18, "eighteen", "eitín", "dieciocho"],
  [19, "nineteen", "naintín", "diecinueve"],
  [20, "twenty", "tuénti", "veinte"],
  [30, "thirty", "zérti", "treinta"],
  [40, "forty", "fórti", "cuarenta"],
  [50, "fifty", "fífti", "cincuenta"],
  [60, "sixty", "síksti", "sesenta"],
  [70, "seventy", "séventi", "setenta"],
  [80, "eighty", "éiti", "ochenta"],
  [90, "ninety", "náinti", "noventa"],
  [100, "one hundred", "uán jándred", "cien"],
];

const COLORS: Array<[string, string, string, string]> = [
  ["red", "#dc2626", "red", "rojo"],
  ["blue", "#2563eb", "blu", "azul"],
  ["yellow", "#facc15", "iélou", "amarillo"],
  ["green", "#16a34a", "grin", "verde"],
  ["orange", "#f97316", "órinch", "naranja"],
  ["purple", "#9333ea", "pérpol", "morado"],
  ["pink", "#f472b6", "pink", "rosado"],
  ["brown", "#92400e", "bráun", "café"],
  ["black", "#111827", "blak", "negro"],
  ["white", "#ffffff", "uáit", "blanco"],
  ["gray", "#9ca3af", "gréi", "gris"],
];

export const BOARDS: readonly Board[] = [
  {
    id: "alphabet",
    title: "Abecedario",
    titleEn: "The alphabet",
    icon: "🔤",
    color: "#7c3aed",
    hint: "Toca una letra: escucharás cómo se llama y una palabra que empieza con ella.",
    tiles: LETTERS.map(([label, say, hint, en, emoji, es]) => ({
      id: label,
      label,
      say: `${say}. ${en}`,
      hint,
      es: `Letra ${label}`,
      example: { en, emoji, es },
    })),
  },
  {
    id: "numbers",
    title: "Números",
    titleEn: "Numbers",
    icon: "🔢",
    color: "#c2410c",
    hint: "Toca un número para escucharlo. Para 21, 35, 99… se une la decena con el número: twenty-one.",
    tiles: NUMBERS.map(([n, en, hint, es]) => ({ id: String(n), label: String(n), say: en, hint, es: `${en} · ${es}` })),
  },
  {
    id: "colors",
    title: "Colores",
    titleEn: "Colors",
    icon: "🎨",
    color: "#be185d",
    hint: "Toca un color para escucharlo. Recuerda: el color va antes de la cosa (a red car).",
    tiles: COLORS.map(([en, color, hint, es]) => ({ id: en, label: en, say: en, hint, es, color })),
  },
];

export function getBoard(id: string): Board | undefined {
  return BOARDS.find((b) => b.id === id);
}
