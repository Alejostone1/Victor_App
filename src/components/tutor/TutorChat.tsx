"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { MiniListen } from "@/components/lesson/AudioButtons";
import { useSpeechRecognitionSupport } from "@/components/lesson/Pronunciation";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { listen, SpeechError } from "@/lib/speech/stt";
import { setVoiceRate, speak, stopSpeaking } from "@/lib/speech/tts";
import { parseTutorReply, STREAM_AUTH_ERROR_MARK, STREAM_BUSY_MARK, STREAM_ERROR_MARK, stripStreamMarks } from "@/lib/tutor/format";
import { TUTOR_SCENARIOS, type TutorScenario } from "@/lib/tutor/scenarios";
import { cn } from "@/lib/utils";

const t = UI_STRINGS.tutor;

type ChatMessage = { role: "user" | "assistant"; content: string };
type ErrorKey = keyof typeof t.errors;

type Props = { enabled: boolean; voiceRate: number };

/** Conversación libre con el tutor IA: elige una situación, escribe o habla, y Anna responde en streaming. */
export function TutorChat({ enabled, voiceRate }: Props) {
  const [scenario, setScenario] = useState<TutorScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const micSupported = useSpeechRecognitionSupport();

  useEffect(() => {
    setVoiceRate(voiceRate);
    return () => {
      stopSpeaking();
      abortRef.current?.abort();
    };
  }, [voiceRate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, error]);

  /** Pide la respuesta del tutor para esta conversación y la va pintando a medida que llega. */
  async function requestReply(current: TutorScenario, history: ChatMessage[]) {
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let text = "";
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: current.id, messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        const key = data?.error && data.error in t.errors ? (data.error as ErrorKey) : "generic";
        setError(key);
        return;
      }
      setMessages([...history, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: stripStreamMarks(text) }]);
      }
      const authFailed = text.includes(STREAM_AUTH_ERROR_MARK);
      const busy = text.includes(STREAM_BUSY_MARK);
      const failed = authFailed || busy || text.includes(STREAM_ERROR_MARK);
      const finalText = stripStreamMarks(text).trim();
      if (failed || !finalText) {
        setError(authFailed ? "invalid_key" : busy ? "busy" : "generic");
        setMessages(finalText ? [...history, { role: "assistant", content: finalText }] : history);
        return;
      }
      setMessages([...history, { role: "assistant", content: finalText }]);
      const { english } = parseTutorReply(finalText);
      if (english) void speak(english);
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError("generic");
    } finally {
      setStreaming(false);
    }
  }

  function start(next: TutorScenario) {
    stopSpeaking();
    setScenario(next);
    setMessages([]);
    void requestReply(next, []);
  }

  function reset() {
    abortRef.current?.abort();
    stopSpeaking();
    setScenario(null);
    setMessages([]);
    setError(null);
    setInput("");
  }

  function submit(text: string) {
    const content = text.trim();
    if (!scenario || !content || streaming) return;
    stopSpeaking();
    setInput("");
    void requestReply(scenario, [...messages, { role: "user", content }]);
  }

  async function handleMic() {
    setMicError(null);
    setListening(true);
    stopSpeaking();
    try {
      const { transcript } = await listen({ timeoutMs: 8000 });
      submit(transcript);
    } catch (err) {
      setMicError(err instanceof SpeechError ? err.message : UI_STRINGS.speechErrors.unknown);
    } finally {
      setListening(false);
    }
  }

  function retry() {
    if (!scenario) return;
    // Se vuelve a pedir la última respuesta. Una respuesta a medias no se reenvía:
    // la conversación debe terminar en un mensaje del usuario (o estar vacía, para el saludo).
    const history = messages[messages.length - 1]?.role === "assistant" ? messages.slice(0, -1) : messages;
    setMessages(history);
    void requestReply(scenario, history);
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const suggestion = !streaming && lastAssistant ? parseTutorReply(lastAssistant.content).suggestion : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b-2 border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[720px] items-center gap-3">
            <Link
              href="/"
              aria-label={UI_STRINGS.nav.home}
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl text-muted hover:bg-surface"
            >
              ✕
            </Link>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-soft text-2xl" aria-hidden="true">
              👩
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="truncate text-xl font-extrabold leading-tight">{t.title}</h1>
              {scenario && (
                <span className="truncate text-sm text-muted">
                  {scenario.icon} {scenario.title}
                </span>
              )}
            </div>
            {scenario && (
              <button
                type="button"
                onClick={reset}
                aria-label={t.changeTopic}
                className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border-2 border-border px-3 text-sm font-bold hover:bg-surface"
              >
                <span aria-hidden="true">🔄</span>
                <span className="hidden sm:inline">{t.changeTopic}</span>
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-4 px-4 pt-4 pb-56">
          {!enabled ? (
            <p className="rounded-3xl border-2 border-error bg-error-soft p-5 text-lg font-semibold">⚙️ {t.errors.not_configured}</p>
          ) : !scenario ? (
            <ScenarioPicker onPick={start} />
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((message, i) => (
                  <Bubble key={i} message={message} live={streaming && i === messages.length - 1} />
                ))}
              </AnimatePresence>
              {streaming && messages[messages.length - 1]?.role !== "assistant" && (
                <p className="flex items-center gap-2 text-muted" role="status">
                  <span className="animate-pulse text-2xl" aria-hidden="true">
                    💬
                  </span>
                  {t.typing}
                </p>
              )}
              {error && (
                <div className="flex flex-col gap-3 rounded-3xl border-2 border-error bg-error-soft p-4" role="alert">
                  <p className="text-lg font-semibold">{t.errors[error]}</p>
                  {(error === "generic" || error === "unauthorized") && (
                    <Button variant="secondary" onClick={retry}>
                      🔄 {t.retry}
                    </Button>
                  )}
                </div>
              )}
              <div ref={bottomRef} className="h-px" />
            </>
          )}
        </main>

        {enabled && scenario && (
          <footer className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-[720px] flex-col gap-2">
              {suggestion && (
                <button
                  type="button"
                  onClick={() => setInput(suggestion.en)}
                  className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary/5 px-3 py-2 text-left"
                  aria-label={`${t.useSuggestion}: ${suggestion.en}`}
                >
                  <span aria-hidden="true">👉</span>
                  <span className="flex min-w-0 flex-col">
                    <span lang="en" className="font-bold">
                      {suggestion.en}
                    </span>
                    {suggestion.es && <span className="text-sm text-muted">{suggestion.es}</span>}
                  </span>
                </button>
              )}
              {micError && <p className="rounded-xl bg-error-soft p-2 text-center text-sm font-semibold">{micError}</p>}
              {listening && <p className="text-center font-bold text-error">🎤 {t.listening}</p>}
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  lang="en"
                  autoComplete="off"
                  maxLength={500}
                  disabled={streaming}
                  aria-label={t.placeholder}
                  className="min-h-touch min-w-0 flex-1 rounded-2xl border-2 border-border bg-background px-4 text-lg focus:border-primary disabled:opacity-60"
                />
                {micSupported && (
                  <button
                    type="button"
                    onClick={handleMic}
                    disabled={streaming || listening}
                    aria-label={t.mic}
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center rounded-full text-2xl text-white shadow-[0_3px_0_0_rgb(0_0_0/0.2)] disabled:opacity-50",
                      listening ? "animate-pulse bg-error" : "bg-primary",
                    )}
                  >
                    <span aria-hidden="true">🎤</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={streaming || input.trim().length === 0}
                  aria-label={t.send}
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success text-2xl text-white shadow-[0_3px_0_0_rgb(0_0_0/0.2)] disabled:opacity-40"
                >
                  <span aria-hidden="true">➤</span>
                </button>
              </form>
            </div>
          </footer>
        )}
      </div>
    </MotionConfig>
  );
}

function ScenarioPicker({ onPick }: { onPick: (s: TutorScenario) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-3xl bg-success-soft p-4">
        <span className="text-4xl" aria-hidden="true">
          👩
        </span>
        <p className="text-lg">{t.intro}</p>
      </div>
      <h2 className="text-2xl font-extrabold">{t.chooseTitle}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TUTOR_SCENARIOS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="flex h-full w-full items-center gap-4 rounded-3xl border-2 border-border bg-surface p-4 text-left shadow-[0_4px_0_0_var(--border)] transition-transform hover:border-primary active:translate-y-1 active:shadow-none"
            >
              <span className="text-4xl" aria-hidden="true">
                {s.icon}
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-extrabold">{s.title}</span>
                <span className="text-muted">{s.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bubble({ message, live }: { message: ChatMessage; live: boolean }) {
  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <p lang="en" className="max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-3 text-lg font-semibold text-primary-foreground">
          {message.content}
        </p>
      </motion.div>
    );
  }
  const reply = parseTutorReply(message.content);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-xl" aria-hidden="true">
        👩
      </span>
      <div className="flex max-w-[85%] flex-col gap-2 rounded-3xl rounded-bl-md border-2 border-border bg-surface px-4 py-3">
        <div className="flex items-start gap-2">
          <p lang="en" className="flex-1 text-xl font-bold">
            {reply.english || "…"}
            {live && <span className="ml-1 inline-block animate-pulse">▍</span>}
          </p>
          {!live && reply.english && <MiniListen text={reply.english} />}
        </div>
        {reply.tips.map((tip) => (
          <p key={tip} className="rounded-2xl bg-[#fff4d6] px-3 py-2 text-base text-[#5c3d00] dark:bg-[#3a3012] dark:text-[#f5c542]">
            💡 {tip}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
