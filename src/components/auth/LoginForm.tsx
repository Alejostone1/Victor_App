"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UI_STRINGS } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const t = UI_STRINGS.login;
type Status = "idle" | "sending" | "sent";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "link" ? t.linkError : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError(t.invalidEmail);
      return;
    }

    setError(null);
    setStatus("sending");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    });

    if (authError) {
      setStatus("idle");
      setError(authError.status === 429 ? t.rateLimited : UI_STRINGS.genericError);
      return;
    }
    setEmail(clean);
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-4 text-center" role="status">
        <p className="text-6xl" aria-hidden="true">
          📬
        </p>
        <h2 className="text-2xl font-bold">{t.sentTitle}</h2>
        <p>{t.sentBody(email)}</p>
        <p className="text-muted">{t.sentHint}</p>
        <Button variant="ghost" onClick={() => setStatus("idle")}>
          {t.useOtherEmail}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label htmlFor="email" className="text-lg font-bold">
        {t.emailLabel}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "login-error" : undefined}
        className="min-h-touch rounded-2xl border-2 border-border bg-surface px-4 py-3 text-lg outline-none focus:border-primary"
      />
      {error && (
        <p id="login-error" role="alert" className="rounded-xl bg-error-soft p-3 font-semibold text-foreground">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? t.sending : t.submit}
      </Button>
    </form>
  );
}
