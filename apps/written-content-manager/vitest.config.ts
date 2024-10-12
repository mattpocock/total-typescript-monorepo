import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup-tests.ts"],
    // Enable once I have WiFi
    // coverage: {
    //   enabled: true,
    //   include: ["app/modules/**/**"],
    // },
  },
});
