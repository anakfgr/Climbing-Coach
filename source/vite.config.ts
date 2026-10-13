import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" so the build works under any GitHub Pages sub-path (e.g. /Climbing-Coach/)
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { target: "es2019", sourcemap: false, assetsDir: "" }, // flat output: uploads cleanly through the GitHub web UI
});
