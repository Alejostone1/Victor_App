"use client";

import { motion } from "framer-motion";
import { ActionBar } from "@/components/lesson/ActionBar";
import { MiniListen } from "@/components/lesson/AudioButtons";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";

type Props = { tip: { es: string; example: string }; onDone: () => void };

/** Dato de gramática corto antes de empezar la lección. */
export function GrammarTip({ tip, onDone }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          className="text-7xl"
          aria-hidden="true"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.2, repeat: 2 }}
        >
          💡
        </motion.span>
        <h2 className="text-3xl font-extrabold">{UI_STRINGS.lesson.tipTitle}</h2>
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-surface p-6">
        <p className="text-xl leading-relaxed">{tip.es}</p>
        <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
          <p lang="en" className="flex-1 text-xl font-bold text-primary">
            {tip.example}
          </p>
          <MiniListen text={tip.example} />
        </div>
      </div>
      <ActionBar>
        <Button onClick={onDone}>{UI_STRINGS.lesson.tipButton}</Button>
      </ActionBar>
    </motion.div>
  );
}
