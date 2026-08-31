import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { jsonResponse, stubApi } from "../test/api";
import type { Note } from "../types";
import { NotesPage } from "./NotesPage";

const note: Note = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Launch notes",
  markdown: "# Decisions\n\nKeep the first version small.",
  taskId: null,
  updatedAt: "2026-09-01T10:00:00Z",
};

describe("NotesPage", () => {
  it("shows a loading state while notes are pending", () => {
    stubApi({
      "GET /notes": () => new Promise<Response>(() => undefined),
    });

    render(<NotesPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading notes");
  });

  it("shows an error and retries into the empty state", async () => {
    let attempts = 0;
    stubApi({
      "GET /notes": () => {
        attempts += 1;
        return attempts === 1
          ? jsonResponse({ detail: "Notes are unavailable." }, 500)
          : jsonResponse([]);
      },
    });
    render(<NotesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Notes are unavailable.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("button", { name: /Add your first note/ }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("creates a note from the empty-state action", async () => {
    let submitted: Record<string, unknown> | undefined;
    stubApi({
      "GET /notes": () => jsonResponse([]),
      "POST /notes": (init) => {
        submitted = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse(
          {
            ...note,
            title: submitted.title,
            markdown: submitted.markdown,
          },
          201,
        );
      },
    });
    render(<NotesPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Add your first note/ }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Reading list" },
    });
    fireEvent.change(screen.getByLabelText("Markdown"), {
      target: { value: "- The Dispossessed\n- Parable of the Sower" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create note" }));

    expect(await screen.findByText("Reading list")).toBeInTheDocument();
    expect(submitted).toEqual({
      title: "Reading list",
      markdown: "- The Dispossessed\n- Parable of the Sower",
    });
  });

  it("edits and deletes an existing note", async () => {
    let patchBody: Record<string, unknown> | undefined;
    stubApi({
      "GET /notes": () => jsonResponse([note]),
      [`PATCH /notes/${note.id}`]: (init) => {
        patchBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse({
          ...note,
          ...patchBody,
          updatedAt: "2026-09-01T11:00:00Z",
        });
      },
      [`DELETE /notes/${note.id}`]: () => new Response(null, { status: 204 }),
    });
    render(<NotesPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Launch notes" }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Launch decisions" },
    });
    fireEvent.change(screen.getByLabelText("Markdown"), {
      target: { value: "Ship notes CRUD." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Launch decisions")).toBeInTheDocument();
    expect(patchBody).toEqual({
      title: "Launch decisions",
      markdown: "Ship notes CRUD.",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Launch decisions" }),
    );
    await waitFor(() =>
      expect(screen.queryByText("Launch decisions")).not.toBeInTheDocument(),
    );
  });
});
