import type { Visual as VisualData } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const SWATCH: Record<Size, string> = { sm: "size-10", md: "size-16", lg: "size-24", xl: "size-36" };
const SYMBOL: Record<Size, string> = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl", xl: "text-8xl" };
const EMOJI: Record<Size, string> = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl", xl: "text-7xl" };

/** Muestra de color, símbolo grande (letra/número) o emoji. Prioridad: color > símbolo > emoji. */
export function Visual({ visual, size = "md", className }: { visual: VisualData; size?: Size; className?: string }) {
  if (visual.color) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-block shrink-0 rounded-full border-4 border-black/10 shadow-[inset_0_-6px_0_0_rgb(0_0_0/0.12)] dark:border-white/20",
          SWATCH[size],
          className,
        )}
        style={{ backgroundColor: visual.color }}
      />
    );
  }
  if (visual.symbol) {
    return (
      <span aria-hidden="true" lang="en" className={cn("font-black leading-none tracking-tight", SYMBOL[size], className)}>
        {visual.symbol}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={cn("leading-none", EMOJI[size], className)}>
      {visual.emoji}
    </span>
  );
}
