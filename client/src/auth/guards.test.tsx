import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../App";
import { renderWithRouter } from "../test/render";

function holdSessionInitialization() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
}

describe("auth guards", () => {
  it.each(["/", "/login"])(
    "announces session initialization before resolving %s",
    (route) => {
      holdSessionInitialization();
      renderWithRouter(<App />, { route });

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("Opening your session…");
      expect(status.closest("main")).toHaveAttribute("aria-busy", "true");
    },
  );
});
