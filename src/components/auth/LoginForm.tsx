"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { signIn, signUp, type AuthFormState } from "@/lib/auth/actions";
import { UI_STRINGS } from "@/lib/config";

const t = UI_STRINGS.login;
const initialState: AuthFormState = { error: null, username: "" };

const inputClasses =
  "min-h-touch w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-lg outline-none focus:border-primary";

export function LoginForm() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const isSignUp = mode === "signUp";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-muted">{isSignUp ? t.subtitleSignUp : t.subtitleSignIn}</p>
      {/* key: reinicia el estado del formulario al cambiar de modo */}
      <CredentialsForm key={mode} isSignUp={isSignUp} />
      <Button variant="ghost" onClick={() => setMode(isSignUp ? "signIn" : "signUp")}>
        {isSignUp ? t.toSignIn : t.toSignUp}
      </Button>
    </div>
  );
}

function CredentialsForm({ isSignUp }: { isSignUp: boolean }) {
  const [state, formAction, isPending] = useActionState(isSignUp ? signUp : signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-lg font-bold">
          {t.usernameLabel}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t.usernamePlaceholder}
          defaultValue={state.username}
          aria-describedby={isSignUp ? "username-hint" : undefined}
          className={inputClasses}
        />
        {isSignUp && (
          <p id="username-hint" className="text-sm text-muted">
            {t.usernameHint}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-lg font-bold">
          {t.passwordLabel}
        </label>
        <div className="flex gap-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            aria-pressed={showPassword}
            className="min-h-touch min-w-touch shrink-0 rounded-2xl border-2 border-border bg-surface text-2xl"
          >
            <span aria-hidden="true">{showPassword ? "🙈" : "👁️"}</span>
          </button>
        </div>
        {isSignUp && <p className="text-sm text-muted">{t.passwordHint}</p>}
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-error-soft p-3 font-semibold text-foreground">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t.working : isSignUp ? t.submitSignUp : t.submitSignIn}
      </Button>
    </form>
  );
}
