import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup-env.js"],
    include: ["./src/__tests__/**/*.test.ts", "./src/api/__tests__/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist_backup/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
    clearMocks: true,
    mockReset: true,
    reporters: ["default", "html"],
    outputFile: "html/index.html",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
