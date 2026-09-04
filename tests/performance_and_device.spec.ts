import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { uniqueEmail } from "./utils";

test.describe("Performance", () => {
  test("PERF-01 app shell loads within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByTestId("tab-login")).toBeVisible();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000); // 3s budget for a local dev build
  });

  test("PERF-02 pharmacy catalog renders without long tasks blocking input", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Perf Tester", uniqueEmail("perf"), "SecurePass1");
    await new NavPage(page).pharmacy.click();
    const start = Date.now();
    await page.getByTestId("input-medicine-search").fill("Vitamin");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

test.describe("Device Behavior", () => {
  test("DEV-01 app tolerates a network drop after initial data load", async ({ page, context }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Offline Tester", uniqueEmail("offline"), "SecurePass1");
    // Doctors/medicines are fetched once on load and held in React state, so
    // browsing already-visited screens keeps working offline. New writes
    // (booking, checkout, expressing interest) would still need the network.
    await context.setOffline(true);
    await new NavPage(page).pharmacy.click();
    await expect(page.getByTestId("input-medicine-search")).toBeVisible();
    await context.setOffline(false);
  });

  test("DEV-02 state resets cleanly via Reset demo data", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Reset Tester", uniqueEmail("reset"), "SecurePass1");
    const nav = new NavPage(page);
    await nav.pharmacy.click();
    await page.getByTestId("btn-add-m2").click();
    await nav.profile.click();
    await page.getByTestId("btn-reset-demo").click();
    await nav.pharmacy.click();
    await expect(page.getByTestId("btn-view-cart")).toHaveCount(0);
  });
});
