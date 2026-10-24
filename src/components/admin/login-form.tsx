"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/server/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          required
          autoComplete="username"
          className="input"
          placeholder="admin@namiragroup.ir"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          className="input"
        />
      </div>
      {state?.error ? (
        <p role="alert" className="flex items-center gap-2 rounded-btn bg-red-500/15 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LockKeyhole className="h-4 w-4" aria-hidden />}
        {pending ? "در حال ورود…" : "ورود به داشبورد"}
      </button>
    </form>
  );
}
