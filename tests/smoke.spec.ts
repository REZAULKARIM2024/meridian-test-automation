import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { uniqueEmail } from "./utils";

test.describe("Smoke", () => {
  test("SMK-01 app loads with auth screen", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await expect(auth.tabLogin).toBeVisible();
    await expect(auth.tabSignup).toBeVisible();
  });

  test("SMK-02 signup with valid details reaches home", async ({ page }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("QA Tester", uniqueEmail("smk02"), "SecurePass1");
    await expect(nav.home).toBeVisible();
    await expect(page.getByText(/Hi, QA/)).toBeVisible();
  });

  test("SMK-03 all bottom nav tabs load without error", async ({ page }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("Nav Check", uniqueEmail("smk03"), "SecurePass1");
    for (const tab of [nav.book, nav.pharmacy, nav.trials, nav.profile, nav.home]) {
      await tab.click();
      await expect(page.locator("body")).not.toContainText("Error");
    }
  });

  test("SMK-04 logout returns to auth screen", async ({ page }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("Logout Check", uniqueEmail("smk04"), "SecurePass1");
    await nav.profile.click();
    await page.getByTestId("btn-logout").click();
    await expect(auth.tabLogin).toBeVisible();
  });

  test("SMK-05 an existing account can log back in", async ({ page }) => {
    const email = uniqueEmail("smk05");
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("Relog Tester", email, "SecurePass1");
    await nav.profile.click();
    await page.getByTestId("btn-logout").click();
    await auth.login(email, "SecurePass1");
    await expect(nav.home).toBeVisible();
  });
});
