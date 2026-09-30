import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type ProxyOptions } from "vite";
import { fileURLToPath } from "node:url";

const apiProxy: Record<string, ProxyOptions> = {
  "/api": {
    target: process.env.API_URL ?? "http://localhost:4010",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
  server: { port: 5180, strictPort: true, proxy: apiProxy },
  preview: { proxy: apiProxy },
});
