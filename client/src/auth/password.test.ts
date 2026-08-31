import { describe, expect, it } from "vitest";

import { PASSWORD_HINT, passwordChecks, passwordProblem } from "./password";

describe("passwordProblem", () => {
  it("accepts a password with a letter and a number", () => {
    expect(passwordProblem("password1")).toBeNull();
  });

  it("rejects letters only", () => {
    expect(passwordProblem("password")).toBe(PASSWORD_HINT);
  });

  it("rejects numbers only", () => {
    expect(passwordProblem("12345678")).toBe(PASSWORD_HINT);
  });

  it("rejects a short password", () => {
    expect(passwordProblem("ab1")).toBe(PASSWORD_HINT);
  });
});

describe("passwordChecks", () => {
  it("marks each rule separately", () => {
    const checks = Object.fromEntries(
      passwordChecks("password").map((rule) => [rule.id, rule.met]),
    );

    expect(checks).toEqual({
      length: true,
      letter: true,
      number: false,
    });
  });
});
