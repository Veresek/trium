import { describe, expect, it, vi } from "vitest";

import { tasksApi } from "./resources";

describe("tasksApi", () => {
  it("adds an encoded date filter to task queries", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await tasksApi.list({ date: "2026-08-31" });
    await tasksApi.list({ date: "undated" });
    await tasksApi.list();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/tasks?date=2026-08-31",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "/api/tasks?date=undated",
    );
    expect(String(fetchMock.mock.calls[2]?.[0])).toBe("/api/tasks");
  });
});
