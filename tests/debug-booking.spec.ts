import { test } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { BookPage } from "../pages/BookPage";
import { uniqueEmail } from "./utils";

// Standalone diagnostic — not part of the regular suite's pass/fail count.
// Run with: npx playwright test tests/debug-booking.spec.ts --project=chromium --workers=1
// Prints everything relevant to the terminal so it can just be copy-pasted.

test("DEBUG booking flow — full network/console dump", async ({ page }) => {
  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
  });
  page.on("pageerror", (err) => {
    console.log("[BROWSER PAGE ERROR]", err.message);
  });
  page.on("requestfailed", (req) => {
    console.log("[REQUEST FAILED]", req.url(), req.failure()?.errorText);
  });
  page.on("response", async (res) => {
    if (res.url().includes("/api/")) {
      let body = "";
      try { body = await res.text(); } catch { body = "(could not read body)"; }
      console.log(`[API RESPONSE] ${res.request().method()} ${res.url()} -> ${res.status()}`);
      console.log(`[API RESPONSE BODY] ${body.slice(0, 500)}`);
    }
  });

  const auth = new AuthPage(page);
  const nav = new NavPage(page);
  const book = new BookPage(page);

  console.log("=== Step 1: goto ===");
  await auth.goto();

  console.log("=== Step 2: signup ===");
  const email = uniqueEmail("debug");
  await auth.signup("Debug User", email, "SecurePass1");
  await page.waitForTimeout(500);
  console.log("PAGE TEXT AFTER SIGNUP:", (await page.locator("body").innerText()).slice(0, 300));

  console.log("=== Step 3: go to Book tab ===");
  await nav.book.click();
  await page.waitForTimeout(500);
  console.log("PAGE TEXT AFTER NAV:", (await page.locator("body").innerText()).slice(0, 300));

  console.log("=== Step 4: click doctor d1 ===");
  await book.doctor("d1").click();
  await page.waitForTimeout(500);
  console.log("PAGE TEXT AFTER DOCTOR CLICK:", (await page.locator("body").innerText()).slice(0, 300));

  console.log("=== Step 5: click slot 9:00 AM ===");
  await book.slot("9:00 AM").click();
  await page.waitForTimeout(500);
  console.log("PAGE TEXT AFTER SLOT CLICK:", (await page.locator("body").innerText()).slice(0, 300));

  console.log("=== Step 6: click Book appointment ===");
  await book.bookButton.click();
  await page.waitForTimeout(3000); // give it a generous window to settle
  console.log("PAGE TEXT AFTER BOOK CLICK:", (await page.locator("body").innerText()).slice(0, 500));

  console.log("=== DONE ===");
});
