import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { passwordProblem } from "../auth/password";
import {
  AuthCard,
  authErrorClassName,
  buttonClassName,
  fieldClassName,
} from "../components/AuthCard";
import { PasswordRules } from "../components/PasswordRules";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showUnmet, setShowUnmet] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
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
      const user = await register(email, password);
      if (user.verifiedAt) {
        navigate("/", { replace: true });
      } else {
        navigate("/verify", { replace: true, state: { email: user.email } });
      }
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
      title="Create your account"
      description="Keep your tasks, time blocks, and notes private and in sync."
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-moss hover:text-moss-hover" to="/login">
            Log in
          </Link>
        </>
      }
    >
      <form
        aria-busy={pending}
        onSubmit={(event) => void onSubmit(event)}
      >
        <label className="block text-sm text-ink">
          Email
          <input
            aria-describedby={error ? "register-error" : undefined}
            aria-invalid={error !== null}
            autoComplete="email"
            className={fieldClassName}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label className="mt-4 block text-sm text-ink">
          Password
          <input
            aria-describedby={
              error ? "password-rules register-error" : "password-rules"
            }
            aria-invalid={error !== null}
            autoComplete="new-password"
            className={fieldClassName}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Choose a password"
            required
            type="password"
            value={password}
          />
        </label>
        <PasswordRules password={password} showUnmet={showUnmet} />
        <button className={buttonClassName} disabled={pending} type="submit">
          {pending ? "Creating account…" : "Create account"}
        </button>
        {error ? (
          <p
            aria-live="assertive"
            className={authErrorClassName}
            id="register-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </AuthCard>
  );
}
