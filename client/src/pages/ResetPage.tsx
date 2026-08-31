import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { passwordProblem } from "../auth/password";
import {
  AuthCard,
  authErrorClassName,
  buttonClassName,
  fieldClassName,
} from "../components/AuthCard";
import { PasswordRules } from "../components/PasswordRules";

export function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showUnmet, setShowUnmet] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const instanceCode = String(form.get("instanceCode") ?? "");
    const problem = passwordProblem(password);
    setError(null);
    if (problem) {
      setShowUnmet(true);
      setError(problem);
      return;
    }
    setShowUnmet(false);
    setPending(true);
    try {
      await authApi.reset({ email, instanceCode, newPassword: password });
      navigate("/login", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "The request could not be completed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Use your email and this server’s instance code."
      footer={
        <Link className="text-moss hover:text-moss-hover" to="/login">
          Back to login
        </Link>
      }
    >
      <form
        aria-busy={pending}
        onSubmit={(event) => void onSubmit(event)}
      >
        <label className="block text-sm text-ink">
          Email
          <input
            autoComplete="email"
            className={fieldClassName}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label className="mt-4 block text-sm text-ink">
          Instance code
          <input
            autoComplete="off"
            className={fieldClassName}
            name="instanceCode"
            placeholder="Enter code"
            required
            type="password"
          />
        </label>
        <label className="mt-4 block text-sm text-ink">
          New password
          <input
            aria-describedby="password-rules"
            autoComplete="new-password"
            className={fieldClassName}
            name="newPassword"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Choose a new password"
            required
            type="password"
            value={password}
          />
        </label>
        <PasswordRules password={password} showUnmet={showUnmet} />
        <button className={buttonClassName} disabled={pending} type="submit">
          {pending ? "Resetting password…" : "Reset password"}
        </button>
        {error ? (
          <p
            aria-live="assertive"
            className={authErrorClassName}
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </AuthCard>
  );
}
