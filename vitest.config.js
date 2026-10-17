import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["entities/**/*.test.js", "*.test.js"],
    coverage: {
      provider: "v8",
      include: ["app.js", "entities/**/*.js"],
      exclude: ["**/*.test.js", "server.js", "prismaClient.js", "vitest.config.js"],
      reporter: ["text", "html"],
    },
  },
});
