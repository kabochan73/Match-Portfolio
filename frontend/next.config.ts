import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway本番ビルド用。実行に必要なファイルだけを.next/standaloneにまとめてくれるので、
  // 本番イメージにnode_modules全体を含めずに済む
  output: "standalone",
};

export default nextConfig;
