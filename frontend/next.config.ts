import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway本番ビルド用。実行に必要なファイルだけを.next/standaloneにまとめてくれるので、
  // 本番イメージにnode_modules全体を含めずに済む
  output: "standalone",

  // SanctumのCookieセッション認証はSameSite=Laxを内部で強制するため、
  // frontendとbackendが別オリジン(別ドメイン)だとブラウザがCookieを送らず認証が壊れる。
  // ブラウザからのapi/sanctumへのリクエストをこのNext.jsサーバー自身が中継することで、
  // ブラウザから見た通信先を常に自分自身のオリジン1つに統一する
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/sanctum/:path*", destination: `${apiUrl}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;
