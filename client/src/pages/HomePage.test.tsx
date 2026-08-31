import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonResponse, stubApi } from "../test/api";
import type { Task } from "../types";
import { HomePage } from "./HomePage";

function todayValue() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = valueFor("year");
  const month = valueFor("month");
  const day = valueFor("day");
  return `${year}-${month}-${day}`;
}

function todayTask(): Task {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Plan today",
    description: "",
    done: false,
    date: todayValue(),
    timeBlockId: null,
    order: 0,
    createdAt: new Date().toISOString(),
  };
}

describe("HomePage tasks", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses Warsaw time for the greeting, date, and task query", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-31T22:30:00.000Z"));
    stubApi({
      "GET /tasks?date=2026-09-01": () => jsonResponse([]),
    });

    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Good morning." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, September 1/)).toBeInTheDocument();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([input]) =>
          String(input).endsWith("/tasks?date=2026-09-01"),
        ),
    ).toBe(true);
  });

  it("orders mobile review sections around now, tasks, then notes", async () => {
    stubApi();
    render(<HomePage />);

    await screen.findByRole("button", { name: /Add your first task/ });
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(["Around now", "Today’s tasks", "Recent notes"]);
    expect(screen.getByText("Time blocks are unavailable.")).toBeInTheDocument();
    expect(screen.getByText("Notes are unavailable.")).toBeInTheDocument();
  });

  it("shows today’s tasks without requesting the fallback list", async () => {
    const task = todayTask();
    const fallback = vi.fn(() => jsonResponse([]));
    stubApi({
      [`GET /tasks?date=${todayValue()}`]: () => jsonResponse([task]),
      "GET /tasks": fallback,
    });

    render(<HomePage />);

    expect(await screen.findByText(task.title)).toBeInTheDocument();
    expect(
      screen.queryByText(/showing your other tasks/i),
    ).not.toBeInTheDocument();
    expect(fallback).not.toHaveBeenCalled();
  });

  it("shows other tasks when today has none", async () => {
    const otherTask = {
      ...todayTask(),
      id: "33333333-3333-3333-3333-333333333333",
      title: "Review the inbox",
      date: null,
    };
    stubApi({
      [`GET /tasks?date=${todayValue()}`]: () => jsonResponse([]),
      "GET /tasks": () => jsonResponse([otherTask]),
    });

    render(<HomePage />);

    expect(await screen.findByText(otherTask.title)).toBeInTheDocument();
    expect(
      screen.getByText("No tasks for today — showing your other tasks."),
    ).toBeInTheDocument();
  });

  it("shows loading while today’s task request is pending", () => {
    stubApi({
      [`GET /tasks?date=${todayValue()}`]: () =>
        new Promise<Response>(() => undefined),
    });

    render(<HomePage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading today’s tasks",
    );
  });

  it("shows an error, retries, and reaches the empty CTA", async () => {
    let attempts = 0;
    stubApi({
      [`GET /tasks?date=${todayValue()}`]: () => {
        attempts += 1;
        return attempts === 1
          ? jsonResponse({ detail: "Today could not be loaded." }, 500)
          : jsonResponse([]);
      },
    });
    render(<HomePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Today could not be loaded.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("button", { name: /Add your first task/ }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("queries today, creates a task, and toggles it", async () => {
    const created = todayTask();
    let createBody: Record<string, unknown> | undefined;
    let toggleBody: Record<string, unknown> | undefined;
    stubApi({
      [`GET /tasks?date=${todayValue()}`]: () => jsonResponse([]),
      "POST /tasks": (init) => {
        createBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse({ ...created, title: createBody.title }, 201);
      },
      [`PATCH /tasks/${created.id}`]: (init) => {
        toggleBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return jsonResponse({ ...created, ...toggleBody });
      },
    });
    render(<HomePage />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Add your first task/ }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Choose today’s focus" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add to today" }));

    expect(await screen.findByText("Choose today’s focus")).toBeInTheDocument();
    expect(createBody).toMatchObject({
      title: "Choose today’s focus",
      date: todayValue(),
    });
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([input]) =>
          String(input).endsWith(`/tasks?date=${todayValue()}`),
        ),
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Mark Choose today’s focus as done",
      }),
    );
    await waitFor(() => expect(toggleBody).toEqual({ done: true }));
  });
});
