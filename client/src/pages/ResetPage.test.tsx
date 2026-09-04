import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../App";
import { jsonResponse, stubApi } from "../test/api";
import { renderWithRouter } from "../test/render";

function fillResetForm() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Instance code"), {
    target: { value: "forest-code" },
  });
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: "new-password1" },
  });
}

describe("ResetPage", () => {
  it("resets the password and returns to login", async () => {
    stubApi({
      "POST /auth/reset": () => new Response(null, { status: 204 }),
    });
    renderWithRouter(<App />, { route: "/reset" });

    await screen.findByRole("heading", { name: "Reset your password" });
    fillResetForm();
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("announces errors and provides a login link", async () => {
    stubApi({
      "POST /auth/reset": () =>
        jsonResponse({ detail: "Invalid instance code." }, 403),
    });
    renderWithRouter(<App />, { route: "/reset" });

    expect(
      await screen.findByRole("link", { name: "Back to login" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    fillResetForm();
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid instance code.",
    );
  });

  it("shows a readable pending state", async () => {
    stubApi({
      "POST /auth/reset": () => new Promise<Response>(() => undefined),
    });
    renderWithRouter(<App />, { route: "/reset" });

    await screen.findByRole("heading", { name: "Reset your password" });
    fillResetForm();
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    const button = screen.getByRole("button", {
      name: "Resetting password…",
    });
    expect(button).toBeDisabled();
    expect(button.closest("form")).toHaveAttribute("aria-busy", "true");
  });
});
