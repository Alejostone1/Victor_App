import { UI_STRINGS } from "@/lib/config";

export function ExerciseTitle({ children, retry }: { children: string; retry?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {retry && (
        <span className="rounded-full bg-error-soft px-3 py-1 text-sm font-bold text-foreground">
          🔁 {UI_STRINGS.lesson.retryBadge}
        </span>
      )}
      <h2 className="text-2xl font-extrabold sm:text-3xl">{children}</h2>
    </div>
  );
}
