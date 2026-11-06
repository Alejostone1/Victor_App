// Normaliza y compara respuestas (sección 7.3 de la especificación).

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "what's": "what is",
  "where's": "where is",
  "how's": "how is",
  "that's": "that is",
  "there's": "there is",
  "i've": "i have",
  "i'll": "i will",
  "i'd": "i would",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "can't": "can not",
  "cannot": "can not",
  "won't": "will not",
  "let's": "let us",
};

/** Minúsculas, sin tildes ni puntuación, contracciones expandidas y espacios colapsados. */
export function normalize(text: string): string {
  const lowered = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘`´]/g, "'");
  const words = lowered
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => CONTRACTIONS[w] ?? w.replace(/'/g, ""));
  return words.join(" ").replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(" ") : [];
}

/** Distancia de edición; intercambiar dos letras vecinas ("yuo"/"you") cuenta como 1. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

export type GradeResult = "correct" | "almost" | "wrong";

/** Compara una respuesta escrita con la esperada y sus alternativas aceptadas. */
export function gradeText(input: string, answer: string, accept: readonly string[] = []): GradeResult {
  const given = normalize(input);
  if (!given) return "wrong";
  const candidates = [answer, ...accept].map(normalize);
  if (candidates.includes(given)) return "correct";
  // Sin espacios: "thankyou" ≈ "thank you".
  const compact = given.replace(/ /g, "");
  if (candidates.some((c) => c.replace(/ /g, "") === compact)) return "correct";

  const givenWords = given.split(" ");
  const isAlmost = candidates.some((c) => {
    const words = c.split(" ");
    return (
      words.length === givenWords.length && words.every((w, i) => levenshtein(w, givenWords[i]) <= 1)
    );
  });
  return isAlmost ? "almost" : "wrong";
}

/** Opción elegida contra la correcta (texto exacto del contenido). */
export function gradeChoice(selected: string, answer: string): GradeResult {
  return selected === answer ? "correct" : "wrong";
}

/** Frase armada con fichas contra la respuesta (ignora puntuación y mayúsculas). */
export function gradeWordOrder(chosen: readonly string[], answer: string): GradeResult {
  return normalize(chosen.join(" ")) === normalize(answer) ? "correct" : "wrong";
}

/** "how are you ?" → "How are you?" para mostrar respuestas guardadas en minúsculas. */
export function prettySentence(text: string): string {
  const trimmed = text.replace(/\s+([?!.,])/g, "$1").trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
