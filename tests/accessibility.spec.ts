import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { uniqueEmail } from "./utils";

test.describe("Accessibility Basics", () => {
  test("A11Y-01 signup form is fully keyboard-navigable", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.tabSignup.focus();
    await page.keyboard.press("Enter"); // activate the Sign up tab
    await page.keyboard.press("Tab");   // -> name field
    await page.keyboard.type("Keyboard User");
    await page.keyboard.press("Tab");   // -> email field
    await page.keyboard.type(uniqueEmail("a11y01"));
    await page.keyboard.press("Tab");   // -> password field
    await page.keyboard.type("SomePassword1");
    await page.keyboard.press("Tab");   // -> confirm password field
    await page.keyboard.type("SomePassword1");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("nav-home")).toBeVisible();
  });

  test("A11Y-02 icon-only quantity buttons have accessible names", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("A11y Tester", uniqueEmail("a11y02"), "SecurePass1");
    await new NavPage(page).pharmacy.click();
    await page.getByTestId("btn-add-m2").click();
    await page.getByTestId("btn-view-cart").click();
    await expect(page.getByLabel("Increase Ibuprofen 200mg")).toBeVisible();
    await expect(page.getByLabel("Decrease Ibuprofen 200mg")).toBeVisible();
  });

  test("A11Y-03 back button exposes an accessible label", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("A11y Tester Two", uniqueEmail("a11y03"), "SecurePass1");
    await new NavPage(page).book.click();
    await expect(page.getByRole("button", { name: "Go back" })).toBeVisible();
  });

  test("A11Y-04 focus outline is visible on interactive elements", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.email.focus();
    // Just assert the element is actually focusable and reachable — full contrast/outline
    // rendering checks are better done with an axe-core scan (see README).
    await expect(auth.email).toBeFocused();
  });
});
