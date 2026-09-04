import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("renders the title and children in a modal dialog", () => {
    render(
      <Dialog onClose={() => undefined} title="Add task">
        <p>Form fields</p>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Add task" })).toBeInTheDocument();
    expect(screen.getByText("Form fields")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes on Escape, the dimmed backdrop, and the close button", () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} title="Add task">
        <p>Form fields</p>
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("moves initial focus to the dialog title", () => {
    render(
      <Dialog onClose={() => undefined} title="Add task">
        <button type="button">Inside</button>
      </Dialog>,
    );

    expect(screen.getByRole("heading", { name: "Add task" })).toHaveFocus();
  });

  it("traps tab inside the dialog", () => {
    render(
      <>
        <button type="button">Outside</button>
        <Dialog onClose={() => undefined} title="Add task">
          <button type="button">Inside</button>
        </Dialog>
      </>,
    );

    const close = screen.getByRole("button", { name: "Close" });
    const inside = screen.getByRole("button", { name: "Inside" });
    inside.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();

    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(inside).toHaveFocus();
  });

  it("restores focus to the opener when the dialog closes", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            Open
          </button>
          {open ? (
            <Dialog onClose={() => setOpen(false)} title="Add task">
              <button type="button">Inside</button>
            </Dialog>
          ) : null}
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open" });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("dialog", { name: "Add task" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(opener).toHaveFocus();
  });

  it("closes only the top dialog on Escape when two are stacked", () => {
    const onCloseOuter = vi.fn();
    const onCloseInner = vi.fn();
    render(
      <Dialog onClose={onCloseOuter} title="Edit block">
        <p>Form fields</p>
        <Dialog onClose={onCloseInner} title="Delete this block?">
          <p>This cannot be undone.</p>
        </Dialog>
      </Dialog>,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit block" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Delete this block?" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
  });

  it("restores page scroll after stacked dialogs unmount together", () => {
    function Harness({ open }: { open: boolean }) {
      return open ? (
        <Dialog onClose={() => undefined} title="Edit block">
          <p>Form fields</p>
          <Dialog onClose={() => undefined} title="Delete this block?">
            <p>This cannot be undone.</p>
          </Dialog>
        </Dialog>
      ) : null;
    }

    const { rerender } = render(<Harness open />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Harness open={false} />);
    expect(document.body.style.overflow).toBe("");
  });
});
