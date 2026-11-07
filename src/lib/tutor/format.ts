// Formato de las respuestas del tutor, compartido por el servidor y la pantalla.

/** Línea de corrección o elogio, en español. */
export const TIP_MARK = "💡";
/** Línea con una respuesta sugerida: "inglés (español)". */
export const SUGGESTION_MARK = "👉";
/** El servidor la agrega al final del texto si la respuesta falló a mitad de camino. */
export const STREAM_ERROR_MARK = "\u0000ERROR";
/** Igual, pero la clave de la API no es válida (hay que revisarla en Vercel). */
export const STREAM_AUTH_ERROR_MARK = "\u0000AUTH";

export type TutorReply = {
  /** Lo que dice Anna en inglés (lo que se lee en voz alta). */
  english: string;
  tips: string[];
  suggestion: { en: string; es: string | null } | null;
};

/** Separa la respuesta en inglés, las correcciones (💡) y la frase sugerida (👉). Tolera texto incompleto. */
export function parseTutorReply(text: string): TutorReply {
  const english: string[] = [];
  const tips: string[] = [];
  let suggestion: TutorReply["suggestion"] = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith(TIP_MARK)) {
      tips.push(line.slice(TIP_MARK.length).trim());
    } else if (line.startsWith(SUGGESTION_MARK)) {
      const body = line.slice(SUGGESTION_MARK.length).trim();
      const match = body.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
      suggestion = match ? { en: match[1].trim(), es: match[2].trim() } : { en: body, es: null };
    } else {
      english.push(line.replace(/\*\*/g, ""));
    }
  }
  return { english: english.join(" "), tips, suggestion };
}
