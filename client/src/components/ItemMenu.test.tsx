import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ItemMenu } from "./ItemMenu";

describe("ItemMenu", () => {
  it("opens the menu and runs the chosen action", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ItemMenu
        label="Actions for Write report"
        onDelete={onDelete}
        onEdit={onEdit}
      />,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Write report" }),
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Write report" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape and a click outside", () => {
    render(
      <div>
        <button type="button">Outside</button>
        <ItemMenu
          label="Actions for Write report"
          onDelete={() => undefined}
          onEdit={() => undefined}
        />
      </div>,
    );

    const trigger = screen.getByRole("button", {
      name: "Actions for Write report",
    });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
