import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");

  if (!process.env.SITE_URL && env.SITE_URL) {
    process.env.SITE_URL = env.SITE_URL;
  }

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: [
        "tests/unit/**/*.test.ts",
        "tests/unit/**/*.test.tsx",
        "tests/integration/**/*.test.ts",
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
      },
    },
  };
});
