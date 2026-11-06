import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.18)] hover:brightness-105 active:translate-y-0.5 active:shadow-none",
  secondary: "border-2 border-border bg-surface text-foreground hover:bg-background",
  ghost: "text-primary underline-offset-4 hover:underline",
};

/** Clases de botón reutilizables (también para <Link>). Mínimo 48px de alto. */
export function buttonClasses(variant: Variant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-bold transition",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
