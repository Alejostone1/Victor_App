import type { ReactNode } from "react";

/** Barra fija abajo con el botón principal ("Comprobar", "Continuar"). */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-border bg-background/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="mx-auto flex max-w-[720px] flex-col gap-2">{children}</div>
    </div>
  );
}
