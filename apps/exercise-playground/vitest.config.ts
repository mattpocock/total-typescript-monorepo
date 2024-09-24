import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*{problem,solution,explainer}*.{ts,tsx}"],
  },
});
