import { passwordChecks } from "../auth/password";

interface PasswordRulesProps {
  password: string;
  showUnmet?: boolean;
}

export function PasswordRules({
  password,
  showUnmet = false,
}: PasswordRulesProps) {
  const checks = passwordChecks(password);

  return (
    <ul
      aria-label="Password requirements"
      aria-live="polite"
      className="mt-2 space-y-1"
      id="password-rules"
    >
      {checks.map((rule) => (
        <li
          key={rule.id}
          className={[
            "text-xs",
            rule.met ? "text-moss" : showUnmet ? "text-rust" : "text-ink-faint",
          ].join(" ")}
        >
          <span className="sr-only">{rule.met ? "Met: " : "Not met: "}</span>
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
