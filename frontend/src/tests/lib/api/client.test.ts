import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiValidationError, apiFetch } from "@/lib/api/client";

// テスト間でXSRF-TOKEN Cookieが残らないよう、既存のCookieをすべて期限切れにして消す
function clearCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as Response;
}

function noContentResponse(): Response {
  return { status: 204, ok: true, json: () => Promise.reject() } as Response;
}

describe("apiFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearCookies();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearCookies();
  });

  it("does not request a CSRF cookie for a GET request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await apiFetch("/api/profile");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/profile");
    expect(init.method).toBe("GET");
  });

  it("requests a CSRF cookie before a non-GET request", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {})) // /sanctum/csrf-cookie
      .mockResolvedValueOnce(jsonResponse(200, { id: 1 })); // 本体のリクエスト

    await apiFetch("/api/likes", {
      method: "POST",
      body: { like_type: "standard" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:8000/sanctum/csrf-cookie",
    );
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8000/api/likes");
  });

  it("JSON-encodes a plain object body and sets Content-Type", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(201, { id: 1 }));

    await apiFetch("/api/likes", {
      method: "POST",
      body: { job_posting_id: 1 },
    });

    const [, init] = fetchMock.mock.calls[1];
    expect(init.body).toBe(JSON.stringify({ job_posting_id: 1 }));
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("passes a FormData body through unmodified without a Content-Type header", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    const formData = new FormData();
    formData.append("image", "dummy");

    await apiFetch("/api/company/avatar", { method: "POST", body: formData });

    const [, init] = fetchMock.mock.calls[1];
    expect(init.body).toBe(formData);
    expect((init.headers as Headers).has("Content-Type")).toBe(false);
  });

  it("sends the XSRF-TOKEN cookie value as a request header when present", async () => {
    document.cookie = "XSRF-TOKEN=abc%20123";
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    await apiFetch("/api/likes", { method: "POST", body: {} });

    const [, init] = fetchMock.mock.calls[1];
    expect((init.headers as Headers).get("X-XSRF-TOKEN")).toBe("abc 123");
  });

  it("omits the X-XSRF-TOKEN header when no cookie is set", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

    await apiFetch("/api/profile");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).has("X-XSRF-TOKEN")).toBe(false);
  });

  it("returns undefined for a 204 No Content response", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {})) // /sanctum/csrf-cookie
      .mockResolvedValueOnce(noContentResponse());

    const result = await apiFetch<void>("/api/logout", { method: "DELETE" });

    expect(result).toBeUndefined();
  });

  it("returns the parsed JSON body on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { id: 42, name: "テスト" }),
    );

    const result = await apiFetch<{ id: number; name: string }>("/api/profile");

    expect(result).toEqual({ id: 42, name: "テスト" });
  });

  it("throws ApiValidationError with field errors on a 422 response", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {})) // /sanctum/csrf-cookie
      .mockResolvedValueOnce(
        jsonResponse(422, {
          message: "入力内容を確認してください",
          errors: { email: ["メールアドレスの形式が正しくありません。"] },
        }),
      );

    await expect(
      apiFetch("/api/login", { method: "POST", body: {} }),
    ).rejects.toBeInstanceOf(ApiValidationError);
  });

  it("falls back to a default message/empty errors when a 422 body has neither", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(422, {}));

    try {
      await apiFetch("/api/login");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiValidationError);
      const validationError = error as ApiValidationError;
      expect(validationError.message).toBe("入力内容を確認してください");
      expect(validationError.errors).toEqual({});
    }
  });

  it("throws a plain Error with the server message on other non-ok responses", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(500, { message: "サーバーエラーが発生しました" }),
    );

    await expect(apiFetch("/api/profile")).rejects.toThrow(
      "サーバーエラーが発生しました",
    );
  });

  it("falls back to a status-code message when a non-ok response has no JSON body", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 500,
      ok: false,
      json: () => Promise.reject(new Error("not json")),
    } as Response);

    await expect(apiFetch("/api/profile")).rejects.toThrow(
      "APIリクエストに失敗しました (status: 500)",
    );
  });
});
