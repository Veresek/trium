import { describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./client";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest", () => {
  it("retries the original request after a successful refresh", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ detail: "Not authenticated." }, 401))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(json({ email: "ada@example.com" }, 200));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ email: string }>("/users/me");

    expect(result).toEqual({ email: "ada@example.com" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/auth/refresh");
  });

  it("does not retry auth routes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json({ detail: "Invalid email or password." }, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest("/auth/login", { method: "POST", body: "{}" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reads a FastAPI validation error as plain text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json(
        {
          detail: [
            {
              type: "value_error",
              loc: ["body", "password"],
              msg: "Value error, That password does not meet the requirements.",
              ctx: { error: {} },
            },
          ],
        },
        422,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest("/auth/register", { method: "POST", body: "{}" }),
    ).rejects.toMatchObject({
      message: "That password does not meet the requirements.",
    });
  });
});
