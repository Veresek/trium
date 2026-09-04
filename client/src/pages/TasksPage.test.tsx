import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { jsonResponse, stubSignedIn } from "../test/api";
import { renderPage } from "../test/render";
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
    stubSignedIn({
      "GET /tasks": () => new Promise<Response>(() => undefined),
    });

    renderPage(<TasksPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks");
  });

  it("shows an error and retries into the empty state", async () => {
    let attempts = 0;
    stubSignedIn({
      "GET /tasks": () => {
        attempts += 1;
        return attempts === 1
          ? jsonResponse({ detail: "Tasks are unavailable." }, 500)
          : jsonResponse([]);
      },
    });
    renderPage(<TasksPage />);

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
    stubSignedIn({
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
    renderPage(<TasksPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Add your first task/ }),
    );
    expect(screen.getByRole("dialog", { name: "Add task" })).toBeInTheDocument();
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
    stubSignedIn({
      "GET /tasks": () => jsonResponse([task]),
      [`PATCH /tasks/${task.id}`]: (init) => {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        patchBodies.push(body);
        return jsonResponse({ ...task, ...body });
      },
      [`DELETE /tasks/${task.id}`]: () => new Response(null, { status: 204 }),
    });
    renderPage(<TasksPage />);

    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: "Mark Write report as done",
      }),
    );
    await waitFor(() => expect(patchBodies[0]).toEqual({ done: true }));

    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Write report" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(screen.getByRole("dialog", { name: "Edit task" })).toBeInTheDocument();
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
      screen.getByRole("button", { name: "Actions for Write final report" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(
      screen.getByRole("dialog", { name: "Delete Write final report?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete task" }));
    await waitFor(() =>
      expect(screen.queryByText("Write final report")).not.toBeInTheDocument(),
    );
  });

  it("shows open tasks above completed ones", async () => {
    stubSignedIn({
      "GET /tasks": () =>
        jsonResponse([
          {
            ...task,
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            title: "Done first from the API",
            done: true,
            order: 0,
          },
          {
            ...task,
            id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            title: "Still open",
            done: false,
            order: 1,
          },
        ]),
    });
    renderPage(<TasksPage />);

    const titles = (await screen.findAllByRole("heading", { level: 3 })).map(
      (heading) => heading.textContent,
    );
    expect(titles).toEqual(["Still open", "Done first from the API"]);
  });

  it("moves a task below open ones after it is marked done", async () => {
    const open = { ...task, title: "Write report", order: 0 };
    const later = {
      ...task,
      id: "22222222-2222-2222-2222-222222222222",
      title: "Read a chapter",
      order: 1,
    };
    stubSignedIn({
      "GET /tasks": () => jsonResponse([open, later]),
      [`PATCH /tasks/${open.id}`]: (init) => {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse({ ...open, ...body });
      },
    });
    renderPage(<TasksPage />);

    expect(
      (await screen.findAllByRole("heading", { level: 3 })).map(
        (heading) => heading.textContent,
      ),
    ).toEqual(["Write report", "Read a chapter"]);

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Mark Write report as done" }),
    );

    await waitFor(() =>
      expect(
        screen.getAllByRole("heading", { level: 3 }).map(
          (heading) => heading.textContent,
        ),
      ).toEqual(["Read a chapter", "Write report"]),
    );
  });

  it("renders task description markdown", async () => {
    stubSignedIn({
      "GET /tasks": () =>
        jsonResponse([
          {
            ...task,
            description: "Draft the **opening**.",
          },
        ]),
    });
    renderPage(<TasksPage />);

    expect(await screen.findByText("opening")).toBeInTheDocument();
    expect(screen.getByText("opening").tagName).toBe("STRONG");
    expect(screen.queryByText("Draft the **opening**.")).not.toBeInTheDocument();
  });
});
