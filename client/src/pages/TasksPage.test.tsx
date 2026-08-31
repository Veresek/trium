import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { jsonResponse, stubApi } from "../test/api";
import type { Task } from "../types";
import { TasksPage } from "./TasksPage";

const task: Task = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Write report",
  description: "Draft the opening.",
  done: false,
  date: null,
  timeBlockId: null,
  order: 0,
  createdAt: "2026-08-31T18:00:00Z",
};

describe("TasksPage", () => {
  it("shows a loading state while tasks are pending", () => {
    stubApi({
      "GET /tasks": () => new Promise<Response>(() => undefined),
    });

    render(<TasksPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks");
  });

  it("shows an error and retries into the empty state", async () => {
    let attempts = 0;
    stubApi({
      "GET /tasks": () => {
        attempts += 1;
        return attempts === 1
          ? jsonResponse({ detail: "Tasks are unavailable." }, 500)
          : jsonResponse([]);
      },
    });
    render(<TasksPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tasks are unavailable.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("button", { name: /Add your first task/ }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("creates a task from the real empty-state action", async () => {
    let submitted: Record<string, unknown> | undefined;
    stubApi({
      "GET /tasks": () => jsonResponse([]),
      "POST /tasks": (init) => {
        submitted = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse(
          {
            ...task,
            title: submitted.title,
            description: submitted.description,
            date: submitted.date,
          },
          201,
        );
      },
    });
    render(<TasksPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Add your first task/ }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Read a chapter" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Start with chapter four." },
    });
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-09-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Read a chapter")).toBeInTheDocument();
    expect(submitted).toMatchObject({
      title: "Read a chapter",
      description: "Start with chapter four.",
      date: "2026-09-01",
    });
  });

  it("toggles, edits, and deletes an existing task", async () => {
    const patchBodies: Record<string, unknown>[] = [];
    stubApi({
      "GET /tasks": () => jsonResponse([task]),
      [`PATCH /tasks/${task.id}`]: (init) => {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        patchBodies.push(body);
        return jsonResponse({ ...task, ...body });
      },
      [`DELETE /tasks/${task.id}`]: () => new Response(null, { status: 204 }),
    });
    render(<TasksPage />);

    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: "Mark Write report as done",
      }),
    );
    await waitFor(() => expect(patchBodies[0]).toEqual({ done: true }));

    fireEvent.click(screen.getByRole("button", { name: "Edit Write report" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Write final report" },
    });
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-09-02" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Write final report")).toBeInTheDocument();
    expect(patchBodies[1]).toMatchObject({
      title: "Write final report",
      date: "2026-09-02",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Write final report" }),
    );
    await waitFor(() =>
      expect(screen.queryByText("Write final report")).not.toBeInTheDocument(),
    );
  });
});
