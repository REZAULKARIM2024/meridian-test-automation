import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { TrialsPage } from "../pages/TrialsPage";
import { uniqueEmail } from "./utils";

test.describe("Clinical Trial Matching", () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Trials Tester", uniqueEmail("trials"), "SecurePass1");
    await new NavPage(page).trials.click();
  });

  test("NEG-10 blocks submission without age or condition", async ({ page }) => {
    const trials = new TrialsPage(page);
    await trials.findButton.click();
    await expect(page.getByText("Enter your age.")).toBeVisible();
    await expect(page.getByText("Select a condition.")).toBeVisible();
  });

  test("NEG-11 rejects out-of-range age", async ({ page }) => {
    const trials = new TrialsPage(page);
    await trials.age.fill("150");
    await trials.condition.selectOption("diabetes");
    await trials.findButton.click();
    await expect(page.getByText("Enter a valid age (0–120).")).toBeVisible();
  });

  test("E2E-05 eligible profile matches and expresses interest", async ({ page }) => {
    const trials = new TrialsPage(page);
    await trials.findMatches("45", "diabetes");
    await expect(trials.resultCount).toContainText("1 matching trial");
    // NOTE: unlike the booking/pharmacy races above, this one isn't fully
    // diagnosed — resultCount reliably shows the right count, but the
    // specific trial card sometimes wasn't found immediately after. This
    // extra explicit wait is a pragmatic mitigation, not a confirmed root
    // cause fix; worth revisiting with a dedicated debug script (see
    // debug-booking.spec.ts for the pattern) if it's still flaky.
    await page.waitForTimeout(300);
    await expect(trials.trialCard("t1")).toBeVisible();
    await trials.interestButton("t1").click();
    await expect(trials.interestButton("t1")).toHaveText("Interest sent");
    await expect(trials.interestButton("t1")).toBeDisabled();
  });

  const boundaryData = [
    { age: "30", condition: "diabetes", expectMatch: true, label: "min age boundary (30) matches diabetes trial" },
    { age: "65", condition: "diabetes", expectMatch: true, label: "max age boundary (65) matches diabetes trial" },
    { age: "29", condition: "diabetes", expectMatch: false, label: "just under min age (29) excluded" },
    { age: "66", condition: "diabetes", expectMatch: false, label: "just over max age (66) excluded" },
    { age: "5", condition: "asthma", expectMatch: false, label: "under pediatric trial min age (5) excluded" },
    { age: "10", condition: "asthma", expectMatch: true, label: "within pediatric trial range (10) matches" },
  ];
  for (const b of boundaryData) {
    test(`DDT-03 age boundary — ${b.label}`, async ({ page }) => {
      const trials = new TrialsPage(page);
      await trials.findMatches(b.age, b.condition);
      if (b.expectMatch) {
        await expect(trials.resultCount).toContainText("1 matching trial");
      } else {
        await expect(trials.resultCount).toContainText("No matching trials");
      }
    });
  }

  test("E2E-06 condition 'none' yields no trials without error", async ({ page }) => {
    const trials = new TrialsPage(page);
    await trials.findMatches("40", "none");
    await expect(trials.resultCount).toContainText("No matching trials");
  });
});
