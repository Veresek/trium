import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

interface RenderWithRouterOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = "/", ...options }: RenderWithRouterOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
