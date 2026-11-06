"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { ExitDialog } from "@/components/lesson/ExitDialog";
import { FeedbackSheet } from "@/components/lesson/FeedbackSheet";
import { GrammarTip } from "@/components/lesson/GrammarTip";
import { LessonComplete } from "@/components/lesson/LessonComplete";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import type { Lesson } from "@/lib/content/schema";
import { playCorrect, playWrong } from "@/lib/sound";
import { setVoiceRate, stopSpeaking } from "@/lib/speech/tts";
import { useLessonStore, type AnswerInput } from "@/stores/lessonStore";

type Props = { lesson: Lesson; unitTitle: string; voiceRate: number };

/** Motor de lección: cola de ejercicios, feedback, reinserción de fallos y pantalla final. */
export function LessonPlayer({ lesson, unitTitle, voiceRate }: Props) {
  const router = useRouter();
  const store = useLessonStore();
  const [exitOpen, setExitOpen] = useState(false);
  const { start } = store;

  // Depende del id, no del objeto: si el servidor vuelve a enviar la misma lección
  // (p. ej. al guardar el progreso), la lección en curso no se reinicia.
  useEffect(() => {
    setVoiceRate(voiceRate);
    start(lesson);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, start]);

  // Hasta que el store cargue esta lección, no se pinta nada de la anterior.
  if (store.lessonId !== lesson.id) return null;

  const item = store.queue[store.index];

  function handleAnswer(input: AnswerInput) {
    if (input.feedback) (input.feedback.result === "wrong" ? playWrong : playCorrect)();
    store.answer(input);
  }

  function handleExit() {
    if (store.finished || store.answers.length === 0) router.push("/");
    else setExitOpen(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <LessonHeader
          done={store.finished ? store.queue.length : store.index}
          total={store.queue.length}
          onExit={handleExit}
        />
        <main className="mx-auto w-full max-w-[720px] flex-1 px-4 pt-2 pb-48">
          {store.finished ? (
            <LessonComplete
              key={store.startedAt}
              lessonId={lesson.id}
              unitTitle={unitTitle}
              answers={store.answers}
              startedAt={store.startedAt}
              onRestart={() => start(lesson)}
            />
          ) : store.showTip && lesson.grammarTip ? (
            <GrammarTip tip={lesson.grammarTip} onDone={store.dismissTip} />
          ) : item ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <ExerciseRenderer
                  exercise={item.exercise}
                  seed={item.key}
                  retry={item.retry}
                  locked={store.feedback !== null}
                  onAnswer={handleAnswer}
                />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </main>
        <FeedbackSheet feedback={store.feedback} titleIndex={store.answers.length} onContinue={store.next} />
        <ExitDialog open={exitOpen} onCancel={() => setExitOpen(false)} />
      </div>
    </MotionConfig>
  );
}
