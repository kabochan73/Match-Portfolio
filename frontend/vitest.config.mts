import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // tsconfig.jsonの"@/*"エイリアスをVite組み込みの解決に任せる(vite-tsconfig-pathsプラグインは不要)
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
