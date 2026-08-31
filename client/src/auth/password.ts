export const PASSWORD_HINT =
  "That password does not meet the requirements.";

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8 && password.length <= 128,
  },
  {
    id: "letter",
    label: "Includes a letter",
    test: (password: string) => /[A-Za-z]/.test(password),
  },
  {
    id: "number",
    label: "Includes a number",
    test: (password: string) => /\d/.test(password),
  },
] as const;

export function passwordChecks(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

export function passwordProblem(password: string): string | null {
  return passwordChecks(password).every((rule) => rule.met)
    ? null
    : PASSWORD_HINT;
}
