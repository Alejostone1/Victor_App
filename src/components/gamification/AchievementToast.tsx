"use client";

import { motion } from "framer-motion";
import { UI_STRINGS } from "@/lib/config";
import type { AchievementView } from "@/lib/gamification/achievements";

/** Tarjetas animadas de logros recién desbloqueados (pantalla final de lección o repaso). */
export function AchievementToast({ achievements, delay = 0.8 }: { achievements: readonly AchievementView[]; delay?: number }) {
  if (achievements.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3" role="status" aria-live="polite">
      {achievements.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: delay + i * 0.25, type: "spring", stiffness: 260, damping: 16 }}
          className="flex items-center gap-4 rounded-3xl border-4 border-[#f5c542] bg-[#fff4d6] p-4 text-left dark:bg-[#3a3012]"
        >
          <motion.span
            className="text-5xl"
            aria-hidden="true"
            initial={{ rotate: -30, scale: 0 }}
            animate={{ rotate: [0, -12, 12, 0], scale: 1 }}
            transition={{ delay: delay + i * 0.25 + 0.2, duration: 0.7 }}
          >
            {a.icon}
          </motion.span>
          <span className="flex flex-col">
            <span className="text-sm font-extrabold uppercase tracking-wide text-[#8a5a00] dark:text-[#f5c542]">
              🏅 {UI_STRINGS.achievements.newTitle}
            </span>
            <span className="text-xl font-extrabold">{a.name}</span>
            <span className="text-muted">{a.condition}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}
