import baseConfig from "./playwright.config";
import { defineConfig } from "@playwright/test";

// Same as playwright.config.ts but serves the Vite DEV server instead of a
// production build — faster to start for quick manual iteration, but can
// show the cold-start flakiness on a fresh `dev:full` start (see notes in
// playwright.config.ts). Use `npm run test:e2e` (the default) for a clean,
// deterministic run; use this only when actively iterating on a test.
export default defineConfig(baseConfig, {
  webServer: {
    command: "npm run dev:full",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
