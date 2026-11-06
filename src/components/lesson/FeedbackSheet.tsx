"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MiniListen } from "@/components/lesson/AudioButtons";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Feedback } from "@/stores/lessonStore";

const t = UI_STRINGS.lesson;

type Props = { feedback: Feedback | null; titleIndex: number; onContinue: () => void };

/** Panel que sube desde abajo: verde si acertó, naranja si no (con la respuesta y 🔊). */
export function FeedbackSheet({ feedback, titleIndex, onContinue }: Props) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key="feedback"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t-4 px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            feedback.result === "wrong" ? "border-error bg-error-soft" : "border-success bg-success-soft",
          )}
          role="status"
          aria-live="assertive"
        >
          <div className="mx-auto flex max-w-[720px] flex-col gap-4">
            <div className="flex items-start gap-3">
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.1 }}
                className="text-4xl"
                aria-hidden="true"
              >
                {feedback.result === "correct" ? "✅" : feedback.result === "almost" ? "👍" : "💡"}
              </motion.span>
              <div className="flex flex-1 flex-col gap-1">
                <p
                  className={cn(
                    "text-2xl font-extrabold",
                    feedback.result === "wrong" ? "text-error" : "text-success",
                  )}
                >
                  {feedback.result === "correct"
                    ? t.correctTitles[titleIndex % t.correctTitles.length]
                    : feedback.result === "almost"
                      ? t.almostTitle
                      : t.wrongTitle}
                </p>
                {feedback.result !== "correct" && feedback.correctAnswer && (
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">{feedback.correctAnswer}</p>
                    {feedback.audio && <MiniListen text={feedback.audio} />}
                  </div>
                )}
                {feedback.result === "correct" && feedback.audio && (
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-muted" lang="en">
                      {feedback.audio}
                    </p>
                    <MiniListen text={feedback.audio} />
                  </div>
                )}
              </div>
            </div>
            <Button
              variant={feedback.result === "wrong" ? "warning" : "success"}
              onClick={onContinue}
              autoFocus
            >
              {UI_STRINGS.continue}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
