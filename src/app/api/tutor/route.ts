import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { TUTOR_CONFIG } from "@/lib/config";
import { localDate } from "@/lib/dates";
import { getLessonProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { STREAM_AUTH_ERROR_MARK, STREAM_ERROR_MARK, TIP_MARK } from "@/lib/tutor/format";
import { buildTutorSystem, TUTOR_START_MESSAGE } from "@/lib/tutor/prompt";
import { getScenario } from "@/lib/tutor/scenarios";

const bodySchema = z.object({
  scenario: z.string().min(1).max(40),
  /** Conversación visible (empieza con el saludo del tutor). */
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .max(TUTOR_CONFIG.maxHistory),
});


function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

/**
 * Conversación con el tutor (Fase 5). Devuelve el texto en streaming (text/plain).
 * Errores: 401 sin sesión · 400 datos inválidos · 429 límite diario · 503 sin clave de la API.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return jsonError("not_configured", 503);

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return jsonError("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  const scenario = parsed.success ? getScenario(parsed.data.scenario) : undefined;
  if (!parsed.success || !scenario) return jsonError("bad_request", 400);

  // Límite diario de mensajes (controla el costo de la API).
  const today = localDate();
  const { data: activity } = await supabase
    .from("daily_activity")
    .select("tutor_messages")
    .eq("activity_date", today)
    .maybeSingle();
  const used = activity?.tutor_messages ?? 0;
  if (used >= TUTOR_CONFIG.dailyMessageLimit) return jsonError("daily_limit", 429);
  await supabase
    .from("daily_activity")
    .upsert({ user_id: userId, activity_date: today, tutor_messages: used + 1 }, { onConflict: "user_id,activity_date" });

  const [{ data: profile }, progress] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    getLessonProgress(),
  ]);
  const system = buildTutorSystem({
    name: profile?.display_name ?? "Estudiante",
    completedLessonIds: progress.completed,
    scenario,
  });

  // El mensaje oculto de inicio va primero para que la conversación empiece con "user".
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: TUTOR_START_MESSAGE },
    ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Haiku no tiene reintento en el servidor con otro modelo (enviar `fallbacks` daría error).
  const fallback = TUTOR_CONFIG.model.includes("haiku")
    ? {}
    : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: TUTOR_CONFIG.model,
    max_tokens: 4000,
    // Conversación corta y casual: poco razonamiento, respuesta rápida.
    output_config: { effort: "low" },
    // Si un filtro de seguridad rechaza el mensaje, el servidor lo reintenta con otro modelo (no en Haiku).
    ...fallback,
    // Caché automático del prefijo (instrucciones + conversación previa).
    cache_control: { type: "ephemeral" },
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wroteText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wroteText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !wroteText) {
          controller.enqueue(encoder.encode(`${TIP_MARK} Hablemos de otra cosa. ¿Qué hiciste hoy?`));
        }
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
          console.error("[tutor] clave de la API inválida", error.message);
          controller.enqueue(encoder.encode(STREAM_AUTH_ERROR_MARK));
        } else {
          if (error instanceof Anthropic.RateLimitError) console.error("[tutor] límite de la API", error.message);
          else if (error instanceof Anthropic.APIError) console.error(`[tutor] API ${error.status}`, error.message);
          else console.error("[tutor] error", error);
          controller.enqueue(encoder.encode(STREAM_ERROR_MARK));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
