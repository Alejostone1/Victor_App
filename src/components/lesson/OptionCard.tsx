"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "dim";

const STYLES: Record<OptionState, string> = {
  idle: "border-border bg-surface hover:border-primary",
  selected: "border-primary bg-primary/10 shadow-[0_4px_0_0_var(--primary)]",
  correct: "border-success bg-success-soft",
  wrong: "border-error bg-error-soft",
  dim: "border-border bg-surface opacity-50",
};

type OptionCardProps = {
  state: OptionState;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  lang?: string;
  className?: string;
};

/** Opción grande y tocable; tiembla cuando es incorrecta. */
export function OptionCard({ state, onClick, disabled, children, lang, className }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      lang={lang}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      animate={state === "wrong" ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-xl font-bold transition-colors disabled:cursor-default",
        STYLES[state],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
