import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [{ find: /^graphql$/, replacement: "graphql/index.js" }],
  },
});
