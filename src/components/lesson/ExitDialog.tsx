"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button, buttonClasses } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";

const t = UI_STRINGS.lesson;

/** Confirmación antes de salir de una lección a medias. */
export function ExitDialog({ open, onCancel }: { open: boolean; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          onKeyDown={(e) => e.key === "Escape" && onCancel()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-surface p-6 text-center"
          >
            <span className="text-5xl" aria-hidden="true">
              🥺
            </span>
            <h2 id="exit-title" className="text-2xl font-extrabold">
              {t.exitTitle}
            </h2>
            <p className="text-muted">{t.exitBody}</p>
            <Button onClick={onCancel} autoFocus>
              {t.exitCancel}
            </Button>
            <Link href="/" className={buttonClasses("secondary")}>
              {t.exitConfirm}
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
