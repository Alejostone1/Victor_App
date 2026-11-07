"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AchievementToast } from "@/components/gamification/AchievementToast";
import { ActionBar } from "@/components/lesson/ActionBar";
import { ListenControls, MiniListen, useAutoPlay } from "@/components/lesson/AudioButtons";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { OptionCard, type OptionState } from "@/components/lesson/OptionCard";
import {
  HighlightedWords,
  MicButton,
  ScoreBadge,
  usePronunciation,
  useSpeechRecognitionSupport,
} from "@/components/lesson/Pronunciation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SPEECH_CONFIG, UI_STRINGS } from "@/lib/config";
import { saveReviewSession, type ReviewSessionInput, type ReviewSessionOutput } from "@/lib/review/actions";
import { playComplete, playCorrect, playWrong } from "@/lib/sound";
import { setVoiceRate, speak, stopSpeaking } from "@/lib/speech/tts";
import { cn, seededShuffle } from "@/lib/utils";

const t = UI_STRINGS.review;

export type ReviewCard = { key: string; front: string; back: string; audio: string };
type Format = "recall" | "listen" | "speak";
type Result = ReviewSessionInput["results"][number];

type Props = { items: readonly ReviewCard[]; pool: readonly string[]; voiceRate: number };

/** Sesión de repaso: alterna recordar, escuchar y pronunciar; al final aplica SM-2 en el servidor. */
export function ReviewSession({ items: initialItems, pool: initialPool, voiceRate }: Props) {
  const router = useRouter();
  // Al guardar, el servidor vuelve a pintar la página con otras palabras: la sesión en curso no cambia.
  const [items] = useState(initialItems);
  const [pool] = useState(initialPool);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    setVoiceRate(voiceRate);
    return () => stopSpeaking();
  }, [voiceRate]);

  const formats = useMemo(
    () =>
      items.map((item, i): Format => {
        const wanted: Format = (["recall", "listen", "speak"] as const)[i % 3];
        const distractors = pool.filter((b) => b !== item.back);
        if (wanted === "listen" && new Set(distractors).size < 2) return "recall";
        return wanted;
      }),
    [items, pool],
  );

  const done = index >= items.length;
  const item = items[index];

  function record(result: Omit<Result, "itemKey" | "format">) {
    setResults((r) => [...r, { itemKey: item.key, format: formats[index], ...result }]);
    setIndex((i) => i + 1);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <LessonHeader done={index} total={items.length} onExit={() => router.push("/review")} />
        <main className="mx-auto w-full max-w-[720px] flex-1 px-4 pt-2 pb-48">
          {done ? (
            <ReviewDone results={results} startedAt={startedAt} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${item.key}-${index}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                {formats[index] === "recall" ? (
                  <RecallCard item={item} onDone={record} />
                ) : formats[index] === "listen" ? (
                  <ListenCard item={item} pool={pool} seed={`${item.key}-${index}`} onDone={record} />
                ) : (
                  <SpeakCard item={item} onDone={record} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </MotionConfig>
  );
}

type CardProps = { item: ReviewCard; onDone: (r: Omit<Result, "itemKey" | "format">) => void };

function Prompt({ children }: { children: string }) {
  return <h2 className="text-2xl font-extrabold sm:text-3xl">{children}</h2>;
}

/** Tres botones para decir qué tan bien lo recordó (calidad SM-2: 1, 3 o 5). */
function RateButtons({ onRate }: { onRate: (quality: 1 | 3 | 5) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-lg font-bold">{t.recallHow}</p>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onRate(1)} className={buttonClasses("warning", "flex-col gap-0 px-2 text-base")}>
          <span aria-hidden="true" className="text-2xl">😕</span>
          {t.rateAgain}
        </button>
        <button type="button" onClick={() => onRate(3)} className={buttonClasses("primary", "flex-col gap-0 px-2 text-base")}>
          <span aria-hidden="true" className="text-2xl">🤔</span>
          {t.rateHard}
        </button>
        <button type="button" onClick={() => onRate(5)} className={buttonClasses("success", "flex-col gap-0 px-2 text-base")}>
          <span aria-hidden="true" className="text-2xl">😄</span>
          {t.rateEasy}
        </button>
      </div>
    </div>
  );
}

/** Ve el español, intenta recordar el inglés, voltea y se califica. */
function RecallCard({ item, onDone }: CardProps) {
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    void speak(item.audio);
  }

  return (
    <div className="flex flex-col gap-6">
      <Prompt>{t.recallTitle}</Prompt>
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-border bg-surface p-6 text-center shadow-[0_6px_0_0_var(--border)]">
        <p className="text-3xl font-extrabold">{item.back}</p>
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-3 rounded-2xl bg-primary/10 px-5 py-3"
            >
              <span lang="en" className="text-3xl font-extrabold text-primary">
                {item.front}
              </span>
              <MiniListen text={item.audio} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ActionBar>
        {revealed ? (
          <RateButtons onRate={(quality) => onDone({ quality, score: null })} />
        ) : (
          <Button onClick={reveal}>👀 {t.recallReveal}</Button>
        )}
      </ActionBar>
    </div>
  );
}

/** Escucha la palabra y elige qué significa. */
function ListenCard({ item, pool, seed, onDone }: CardProps & { pool: readonly string[]; seed: string }) {
  const options = useMemo(() => {
    const others = seededShuffle([...new Set(pool.filter((b) => b !== item.back))], seed).slice(0, 2);
    return seededShuffle([item.back, ...others], `${seed}-o`);
  }, [item.back, pool, seed]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  useAutoPlay(item.audio);
  const correct = selected === item.back;

  function check() {
    setChecked(true);
    (correct ? playCorrect : playWrong)();
  }

  function stateOf(option: string): OptionState {
    if (!checked) return selected === option ? "selected" : "idle";
    if (option === item.back) return "correct";
    return option === selected ? "wrong" : "dim";
  }

  return (
    <div className="flex flex-col gap-6">
      <Prompt>{t.listenTitle}</Prompt>
      <ListenControls text={item.audio} className="py-2" />
      <div className="flex flex-col gap-3" role="radiogroup">
        {options.map((option) => (
          <OptionCard key={option} state={stateOf(option)} disabled={checked} onClick={() => setSelected(option)}>
            {option}
          </OptionCard>
        ))}
      </div>
      {checked && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-center text-xl font-extrabold", correct ? "text-success" : "text-error")}
          role="status"
        >
          {correct ? "✅ " : "💡 "}
          <span lang="en">{item.front}</span> = {item.back}
        </motion.p>
      )}
      <ActionBar>
        {checked ? (
          <Button variant={correct ? "success" : "warning"} onClick={() => onDone({ quality: correct ? 4 : 1, score: null })}>
            {UI_STRINGS.continue}
          </Button>
        ) : (
          <Button onClick={check} disabled={!selected}>
            {UI_STRINGS.check}
          </Button>
        )}
      </ActionBar>
    </div>
  );
}

/** Ve la palabra y la pronuncia. Sin micrófono, se califica a sí mismo. */
function SpeakCard({ item, onDone }: CardProps) {
  const supported = useSpeechRecognitionSupport();
  const { state, attempts, best, record } = usePronunciation(item.front);
  // Sin micrófono o si prefiere no hablar: se califica a sí mismo.
  const [selfRate, setSelfRate] = useState(false);
  useAutoPlay(item.audio);
  const min = SPEECH_CONFIG.defaultMinScore;
  const score = best?.score ?? 0;
  const canRetry = attempts < SPEECH_CONFIG.maxSpeakAttempts && score < 100;

  async function handleMic() {
    const result = await record();
    if (result) (result.score >= min ? playCorrect : playWrong)();
  }

  function finish() {
    onDone({ quality: score >= 90 ? 5 : score >= min ? 4 : 2, score });
  }

  return (
    <div className="flex flex-col gap-6">
      <Prompt>{t.speakTitle}</Prompt>
      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-surface px-4 py-6">
        {state.kind === "result" ? (
          <HighlightedWords result={state.result} />
        ) : (
          <p lang="en" className="text-center text-3xl font-extrabold">
            {item.front}
          </p>
        )}
        <p className="text-center text-lg text-muted">{item.back}</p>
        <ListenControls text={item.audio} size="md" className="pt-3" />
      </div>

      {supported === false || selfRate ? (
        <>
          {supported === false && (
            <p className="rounded-2xl bg-error-soft p-4 text-center font-semibold">{UI_STRINGS.speechNotSupported}</p>
          )}
          <ActionBar>
            <RateButtons onRate={(quality) => onDone({ quality, score: null })} />
          </ActionBar>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3" aria-live="polite">
            {state.kind === "result" ? (
              <ScoreBadge score={state.result.score} passed={state.result.score >= min} />
            ) : (
              <MicButton listening={state.kind === "listening"} onClick={handleMic} disabled={supported === null} />
            )}
            {state.kind === "listening" && <p className="text-xl font-bold">{UI_STRINGS.lesson.speakListening}</p>}
            {state.kind === "error" && (
              <p className="rounded-2xl bg-error-soft p-4 text-center font-semibold">{state.message}</p>
            )}
          </div>
          <ActionBar>
            {attempts > 0 && state.kind !== "listening" ? (
              <>
                <Button variant={score >= min ? "success" : "primary"} onClick={finish}>
                  {UI_STRINGS.continue}
                </Button>
                {canRetry && (
                  <Button variant="ghost" onClick={handleMic}>
                    🎤 {UI_STRINGS.tryAgain}
                  </Button>
                )}
              </>
            ) : (
              <Button variant="ghost" onClick={() => setSelfRate(true)} disabled={state.kind === "listening"}>
                {UI_STRINGS.skipForNow}
              </Button>
            )}
          </ActionBar>
        </>
      )}
    </div>
  );
}

type SaveState = { kind: "saving" } | { kind: "saved"; result: Extract<ReviewSessionOutput, { ok: true }> } | { kind: "error" };

function ReviewDone({ results, startedAt }: { results: readonly Result[]; startedAt: number }) {
  const [state, setState] = useState<SaveState>({ kind: "saving" });
  const started = useRef(false);

  async function save() {
    const payload = { durationSeconds: Math.round((Date.now() - startedAt) / 1000), results: [...results] };
    let result = await saveReviewSession(payload).catch(() => ({ ok: false }) as const);
    if (!result.ok) {
      await new Promise((r) => setTimeout(r, 1500));
      result = await saveReviewSession(payload).catch(() => ({ ok: false }) as const);
    }
    if (!result.ok) return setState({ kind: "error" });
    playComplete();
    setState({ kind: "saved", result });
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "saving") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center" role="status">
        <motion.span className="text-6xl" aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}>
          🧠
        </motion.span>
        <p className="text-xl font-bold">{t.saving}</p>
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
        <span className="text-6xl" aria-hidden="true">📶</span>
        <p className="text-xl font-bold">{t.saveError}</p>
        <ActionBar>
          <Button
            onClick={() => {
              setState({ kind: "saving" });
              void save();
            }}
          >
            {UI_STRINGS.lesson.complete.retrySave}
          </Button>
        </ActionBar>
      </div>
    );
  }

  const { result } = state;
  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      <motion.span
        className="text-8xl"
        aria-hidden="true"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 12 }}
      >
        🧠
      </motion.span>
      <div>
        <h2 className="text-3xl font-extrabold">{t.finishTitle}</h2>
        <p className="mt-2 text-lg text-muted">{t.finishBody(result.total)}</p>
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#f5c542] bg-[#fff4d6] px-2 py-4 dark:bg-[#3a3012]">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">{UI_STRINGS.lesson.complete.xp}</span>
          <span className="text-3xl font-extrabold">⭐ +{result.xp}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-success bg-success-soft px-2 py-4">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">{t.remembered}</span>
          <span className="text-3xl font-extrabold">
            ✅ {result.remembered}/{result.total}
          </span>
        </div>
      </div>
      <AchievementToast achievements={result.achievements} delay={0.4} />
      <ActionBar>
        <Link href="/" className={buttonClasses("success")}>
          {t.back}
        </Link>
      </ActionBar>
    </div>
  );
}
