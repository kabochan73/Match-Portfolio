// このモジュールはServer Component(=Dockerコンテナの中)から実行される。
// NEXT_PUBLIC_API_URLはブラウザから到達できるURL(localhost:8000)のためコンテナ間通信には使えず、
// サーバー専用のAPI_URL(コンテナのサービス名、例: http://app:8080)を優先する。
// API_URL未設定(Dockerを使わずホストで直接next devする場合など)はNEXT_PUBLIC_API_URLにフォールバックする
const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/**
 * 認証不要の公開エンドポイント向けfetchラッパー。Server Componentから呼ぶ想定
 * (apiFetchと違いCookie/CSRF/X-XSRF-TOKENは一切扱わない)。
 * 404は例外にせずnullを返し、呼び出し側でnext/navigationのnotFound()を呼べるようにする
 */
export async function publicFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...options.headers },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`APIリクエストに失敗しました (status: ${response.status})`);
  }

  return response.json() as Promise<T>;
}
