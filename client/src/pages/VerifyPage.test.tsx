import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../App";
import { ada, jsonResponse, stubApi } from "../test/api";
import { renderWithRouter } from "../test/render";

describe("VerifyPage", () => {
  it("verifies an account and opens home", async () => {
    stubApi({
      "POST /auth/verify": () => jsonResponse(ada),
    });
    renderWithRouter(<App />, { route: "/verify" });

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Instance code"), {
      target: { value: "forest-code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify account" }));

    expect(
      await screen.findByRole("heading", {
        name: /Good (morning|afternoon|evening|night)\./,
      }),
    ).toBeInTheDocument();
  });

  it("announces errors and links back to login", async () => {
    stubApi({
      "POST /auth/verify": () =>
        jsonResponse({ detail: "Invalid instance code." }, 403),
    });
    renderWithRouter(<App />, { route: "/verify" });

    expect(
      await screen.findByRole("link", { name: "Back to login" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Instance code"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid instance code.",
    );
  });

  it("shows a readable pending state", async () => {
    stubApi({
      "POST /auth/verify": () => new Promise<Response>(() => undefined),
    });
    renderWithRouter(<App />, { route: "/verify" });

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Instance code"), {
      target: { value: "forest-code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify account" }));

    const button = screen.getByRole("button", { name: "Verifying…" });
    expect(button).toBeDisabled();
    expect(button.closest("form")).toHaveAttribute("aria-busy", "true");
  });
});
