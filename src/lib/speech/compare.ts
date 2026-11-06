import { levenshtein, tokenize } from "@/lib/grading";

export type WordMatch = { word: string; matched: boolean };
export type PronunciationResult = { score: number; words: WordMatch[] };

/** Palabras "casi iguales" cuentan (el reconocedor a veces confunde una letra). */
function similar(a: string, b: string): boolean {
  if (a === b) return true;
  return Math.min(a.length, b.length) >= 4 && levenshtein(a, b) <= 1;
}

/**
 * Puntaje de pronunciación = % de palabras esperadas reconocidas en orden
 * (alineación por subsecuencia común más larga). Devuelve qué palabras faltaron.
 */
export function scorePronunciation(expected: string, heard: string): PronunciationResult {
  // Palabras originales para mostrar (con mayúsculas y puntuación).
  const display = expected.split(/\s+/).filter(Boolean);
  const exp = tokenize(expected);
  const got = tokenize(heard);

  // LCS clásico.
  const dp: number[][] = Array.from({ length: exp.length + 1 }, () => new Array<number>(got.length + 1).fill(0));
  for (let i = exp.length - 1; i >= 0; i--) {
    for (let j = got.length - 1; j >= 0; j--) {
      dp[i][j] = similar(exp[i], got[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const matched = new Array<boolean>(exp.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < exp.length && j < got.length) {
    if (similar(exp[i], got[j])) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }

  const score = exp.length === 0 ? 0 : Math.round((matched.filter(Boolean).length / exp.length) * 100);
  // Si la normalización cambió el número de palabras (contracciones), se marca por palabra visible.
  const words =
    display.length === exp.length
      ? display.map((word, k) => ({ word, matched: matched[k] }))
      : display.map((word) => ({ word, matched: tokenize(word).every((t) => got.includes(t)) }));
  return { score, words };
}

/** Elige, entre las alternativas del reconocedor, la que mejor puntúa contra el texto esperado. */
export function pickBestAlternative(expected: string, alternatives: readonly string[]): string {
  let best = alternatives[0] ?? "";
  let bestScore = -1;
  for (const alt of alternatives) {
    const { score } = scorePronunciation(expected, alt);
    if (score > bestScore) {
      best = alt;
      bestScore = score;
    }
  }
  return best;
}
