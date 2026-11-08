import { z } from "zod";
import { TUTOR_CONFIG } from "@/lib/config";
import { localDate } from "@/lib/dates";
import { getLessonProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { STREAM_AUTH_ERROR_MARK, STREAM_BUSY_MARK, STREAM_ERROR_MARK, TIP_MARK } from "@/lib/tutor/format";
import { buildTutorSystem, TUTOR_START_MESSAGE } from "@/lib/tutor/prompt";
import { type ChatMessage, getTutorProvider, streamTutorReply, TutorProviderError } from "@/lib/tutor/providers";
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
 * Conversación con el tutor (Fase 5): Claude, o Gemini gratis si no hay clave de Claude. Devuelve el texto en streaming (text/plain).
 * Errores: 401 sin sesión · 400 datos inválidos · 429 límite diario · 503 sin clave de la API.
 */
export async function POST(request: Request) {
  const provider = getTutorProvider();
  if (!provider) return jsonError("not_configured", 503);

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
  const messages: ChatMessage[] = [
    { role: "user", content: TUTOR_START_MESSAGE },
    ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const encoder = new TextEncoder();
  const abort = new AbortController();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = streamTutorReply(provider, { system, messages, signal: abort.signal });
        for (;;) {
          const next = await stream.next();
          if (next.done) {
            if (next.value.refused) controller.enqueue(encoder.encode(`${TIP_MARK} Hablemos de otra cosa. ¿Qué hiciste hoy?`));
            break;
          }
          controller.enqueue(encoder.encode(next.value));
        }
      } catch (error) {
        if (abort.signal.aborted) return;
        if (error instanceof TutorProviderError) {
          console.error(`[tutor:${provider}] ${error.kind}`, error.message);
          controller.enqueue(
            encoder.encode(
              error.kind === "auth" ? STREAM_AUTH_ERROR_MARK : error.kind === "busy" ? STREAM_BUSY_MARK : STREAM_ERROR_MARK,
            ),
          );
        } else {
          console.error(`[tutor:${provider}] error`, error);
          controller.enqueue(encoder.encode(STREAM_ERROR_MARK));
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Ya estaba cerrado (el usuario canceló).
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
