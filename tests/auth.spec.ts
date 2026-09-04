import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { uniqueEmail } from "./utils";

test.describe("Auth — Negative & Data-Driven (client-side validation)", () => {
  test("NEG-01 empty login is blocked with validation", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.tabLogin.click();
    await auth.submit.click();
    await expect(page.getByText("Enter your email address.")).toBeVisible();
    await expect(page.getByText("Enter a password.")).toBeVisible();
  });

  const invalidEmails = ["plainaddress", "missing@domain", "@nodomain.com", "spaces in@email.com"];
  for (const email of invalidEmails) {
    test(`NEG-02 invalid email format is rejected: "${email}"`, async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goto();
      await auth.tabLogin.click();
      await auth.email.fill(email);
      await auth.password.fill("somePassword1");
      await auth.submit.click();
      await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    });
  }

  test("NEG-03 signup blocks when passwords don't match", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("QA Tester", uniqueEmail("neg03"), "password123", "password124");
    await expect(page.getByText("Passwords don't match.")).toBeVisible();
  });

  test("NEG-04 signup blocks password under 8 characters", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("QA Tester", uniqueEmail("neg04"), "abc123", "abc123");
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
  });

  test("NEG-05 signup blocks empty full name", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.tabSignup.click();
    await auth.email.fill(uniqueEmail("neg05"));
    await auth.password.fill("password123");
    await auth.confirm.fill("password123");
    await auth.submit.click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
  });

  test("E2E-01 successful signup lands on home", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("New Patient", uniqueEmail("e2e01"), "SecurePass1", "SecurePass1");
    await expect(page.getByText(/Hi, New/)).toBeVisible();
  });
});

test.describe("Auth — Server-side validation (real MySQL-backed API)", () => {
  test("NEG-12 signup rejects an email that's already registered", async ({ page }) => {
    const email = uniqueEmail("neg12");
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("First User", email, "SecurePass1");
    // Log out and try to sign up again with the same email.
    await page.getByTestId("nav-profile").click();
    await page.getByTestId("btn-logout").click();
    await auth.signup("Second User", email, "AnotherPass1");
    await expect(page.getByTestId("auth-server-error")).toContainText("already exists");
  });

  test("NEG-13 login rejects a correct email with the wrong password", async ({ page }) => {
    const email = uniqueEmail("neg13");
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Wrong Pass Tester", email, "CorrectPass1");
    await page.getByTestId("nav-profile").click();
    await page.getByTestId("btn-logout").click();
    await auth.login(email, "WrongPassword1");
    await expect(page.getByTestId("auth-server-error")).toContainText("Invalid email or password");
  });

  test("NEG-14 login rejects an email that was never registered", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.login(uniqueEmail("never-registered"), "SomePassword1");
    await expect(page.getByTestId("auth-server-error")).toContainText("Invalid email or password");
  });
});
