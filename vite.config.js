import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
const __dirname = import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    sentryVitePlugin({
      org: "nivethitha",
      project: "javascript-react",
    }),
  ],

  build: {
    sourcemap: true,
  },
});
