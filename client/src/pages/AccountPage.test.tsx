import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../App";
import { ada, jsonResponse, stubApi } from "../test/api";
import { renderWithRouter } from "../test/render";

async function openDeleteConfirmation() {
  await screen.findByRole("heading", { name: "Account" });
  fireEvent.click(screen.getByRole("button", { name: "Delete my account" }));
}

describe("AccountPage", () => {
  it("cancels account deletion without sending a request", async () => {
    stubApi({}, { user: ada });
    renderWithRouter(<App />, { route: "/account" });

    await openDeleteConfirmation();
    expect(
      screen.getByRole("dialog", {
        name: "Delete your account permanently?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("button", { name: "Yes, delete my account" }),
    ).not.toBeInTheDocument();
    expect(vi.mocked(fetch)).not.toHaveBeenCalledWith(
      "/api/users/me",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("keeps confirmation open and shows an API error", async () => {
    stubApi(
      {
        "DELETE /users/me": () =>
          jsonResponse({ detail: "Account deletion is unavailable." }, 503),
      },
      { user: ada },
    );
    renderWithRouter(<App />, { route: "/account" });

    await openDeleteConfirmation();
    fireEvent.click(
      screen.getByRole("button", { name: "Yes, delete my account" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Account deletion is unavailable.",
    );
    expect(
      screen.getByRole("button", { name: "Yes, delete my account" }),
    ).toBeEnabled();
  });

  it("shows pending state and returns to login after deletion", async () => {
    let finishDelete: (() => void) | undefined;
    stubApi(
      {
        "DELETE /users/me": () =>
          new Promise<Response>((resolve) => {
            finishDelete = () => resolve(new Response(null, { status: 204 }));
          }),
      },
      { user: ada },
    );
    renderWithRouter(<App />, { route: "/account" });

    await openDeleteConfirmation();
    fireEvent.click(
      screen.getByRole("button", { name: "Yes, delete my account" }),
    );

    expect(
      screen.getByRole("button", { name: "Deleting account…" }),
    ).toBeDisabled();
    finishDelete?.();

    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });
});
