import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // dev: /
  // build (prod behind nginx): /dashboard/
  base: command === "serve" ? "/" : "/dashboard/",
  plugins: [react()],
}));
