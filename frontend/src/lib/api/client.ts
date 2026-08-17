const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * LaravelのFormRequestバリデーション失敗(422)を表すエラー。
 * フィールドごとのエラーメッセージをそのまま保持し、フォーム側で表示できるようにする
 */
export class ApiValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiValidationError";
  }
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * SanctumのCookieベースSPA認証は、GET/HEAD以外のリクエスト前にこのエンドポイントを叩いて
 * XSRF-TOKEN Cookieを発行してもらう必要がある(Laravel公式のSPA認証フロー)
 */
async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * 認証必須API向けのfetchラッパー。Client Componentからのみ呼ぶ想定
 * (SanctumのCookie認証はブラウザ側のCookieに依存するため、Server Componentからは使えない)
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();
  }

  // FormData(画像アップロードなど)はブラウザがboundary付きのContent-Typeを
  // 自動設定するため、JSON.stringifyもContent-Type指定もせずそのまま渡す
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (xsrfToken) {
    headers.set("X-XSRF-TOKEN", xsrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => undefined);

  if (response.status === 422) {
    throw new ApiValidationError(
      data?.message ?? "入力内容を確認してください",
      data?.errors ?? {},
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `APIリクエストに失敗しました (status: ${response.status})`,
    );
  }

  return data as T;
}
