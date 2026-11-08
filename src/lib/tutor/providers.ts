import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { TUTOR_CONFIG } from "@/lib/config";

/**
 * Proveedores de IA del tutor. Se usa Claude si hay ANTHROPIC_API_KEY;
 * si no, Gemini (plan gratis de Google) si hay GEMINI_API_KEY.
 */
export type TutorProvider = "claude" | "gemini";

export function getTutorProvider(): TutorProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Error normalizado: `auth` = clave inválida · `busy` = límite del proveedor · `other` = lo demás. */
export class TutorProviderError extends Error {
  constructor(
    readonly kind: "auth" | "busy" | "other",
    message: string,
  ) {
    super(message);
  }
}

type StreamInput = { system: string; messages: ChatMessage[]; signal: AbortSignal };

/** Devuelve el texto de la respuesta en trozos. `refused` = el modelo no quiso responder y no escribió nada. */
export type TutorStream = AsyncGenerator<string, { refused: boolean }>;

export function streamTutorReply(provider: TutorProvider, input: StreamInput): TutorStream {
  return provider === "claude" ? streamClaude(input) : streamGemini(input);
}

async function* streamClaude({ system, messages, signal }: StreamInput): TutorStream {
  const model = TUTOR_CONFIG.model;
  // Haiku no tiene reintento en el servidor con otro modelo (enviar `fallbacks` daría error).
  const fallback = model.includes("haiku")
    ? {}
    : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model,
      max_tokens: 4000,
      // Conversación corta y casual: poco razonamiento, respuesta rápida.
      output_config: { effort: "low" },
      ...fallback,
      // Caché automático del prefijo (instrucciones + conversación previa).
      cache_control: { type: "ephemeral" },
      system,
      messages,
    },
    { signal },
  );

  let wroteText = false;
  try {
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        wroteText = true;
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    return { refused: final.stop_reason === "refusal" && !wroteText };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new TutorProviderError("auth", error.message);
    }
    if (error instanceof Anthropic.RateLimitError) throw new TutorProviderError("busy", error.message);
    if (error instanceof Anthropic.APIError) throw new TutorProviderError("other", `API ${error.status}: ${error.message}`);
    throw error;
  }
}

/** Respuestas cortadas por los filtros de Google (equivalen a un rechazo). */
const GEMINI_BLOCKED = new Set(["SAFETY", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "RECITATION"]);

async function* streamGemini({ system, messages, signal }: StreamInput): TutorStream {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let wroteText = false;
  let blocked = false;
  try {
    const stream = await ai.models.generateContentStream({
      model: TUTOR_CONFIG.geminiModel,
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: system,
        maxOutputTokens: 1500,
        // Conversación casual: el mínimo de razonamiento para responder rápido.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        abortSignal: signal,
      },
    });
    for await (const chunk of stream) {
      if (chunk.promptFeedback?.blockReason) blocked = true;
      const reason = chunk.candidates?.[0]?.finishReason;
      if (reason && GEMINI_BLOCKED.has(reason)) blocked = true;
      const text = chunk.text;
      if (text) {
        wroteText = true;
        yield text;
      }
    }
    return { refused: blocked && !wroteText };
  } catch (error) {
    if (error instanceof ApiError) {
      // 400 con clave mal escrita, 401/403 sin permiso.
      if (error.status === 401 || error.status === 403 || /API key/i.test(error.message)) {
        throw new TutorProviderError("auth", error.message);
      }
      if (error.status === 429) throw new TutorProviderError("busy", error.message);
      throw new TutorProviderError("other", `Gemini ${error.status}: ${error.message}`);
    }
    throw error;
  }
}
