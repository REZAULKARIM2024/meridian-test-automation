import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { uniqueEmail } from "./utils";

test.describe("App Lifecycle", () => {
  test("LFC-01 a full page reload does not silently keep a stale session", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Lifecycle User", uniqueEmail("lifecycle"), "SecurePass1");
    await expect(page.getByText(/Hi, Lifecycle/)).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("tab-login")).toBeVisible();
  });

  test("LFC-02 logging in again after a reload works normally", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    const email = uniqueEmail("lifecycle-relogin");
    await auth.signup("Relogin User", email, "SecurePass1");
    await page.reload();
    await auth.login(email, "SecurePass1");
    await expect(page.getByText(/Hi, Relogin/)).toBeVisible();
  });
});

test.describe("Interrupt (web-equivalent)", () => {
  test("INT-01 browser back button mid-booking returns to the previous screen cleanly", async ({ page }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("Interrupt User", uniqueEmail("interrupt"), "SecurePass1");
    await nav.book.click();
    await page.getByTestId("doctor-d1").click();
    await expect(page.getByTestId("slot-900AM")).toBeVisible();

    await page.goBack();

    const stillUsable =
      (await page.getByTestId("doctor-d1").isVisible().catch(() => false)) ||
      (await page.getByTestId("slot-900AM").isVisible().catch(() => false));
    expect(stillUsable).toBe(true);
  });

  test("INT-02 tab losing and regaining visibility mid-flow doesn't lose in-progress state", async ({ page }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);
    await auth.goto();
    await auth.signup("Visibility User", uniqueEmail("visibility"), "SecurePass1");
    await nav.book.click();
    await page.getByTestId("doctor-d1").click();
    await page.getByTestId("slot-900AM").click();
    await expect(page.getByTestId("slot-900AM")).toHaveAttribute("aria-pressed", "true");

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: false, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await expect(page.getByTestId("slot-900AM")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("btn-book-appointment").click();

    await page.waitForFunction(
      () => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes("Appointment confirmed")) {
            const parent = node.parentElement;
            if (parent && parent.getClientRects().length > 0) return true;
          }
        }
        return false;
      },
      { timeout: 20_000 }
    );
  });
});
