import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_CONFIG, UI_STRINGS } from "@/lib/config";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border-2 border-border bg-surface p-6 sm:p-8">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-5xl" aria-hidden="true">
            👋
          </p>
          <p className="text-lg font-bold text-primary">{APP_CONFIG.name}</p>
          <h1 className="text-3xl font-extrabold">{UI_STRINGS.login.title}</h1>
          <p className="text-muted">{UI_STRINGS.login.subtitle}</p>
        </header>
        {/* useSearchParams necesita un límite de Suspense con Cache Components */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
