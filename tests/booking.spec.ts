import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { BookPage } from "../pages/BookPage";
import { uniqueEmail } from "./utils";

test.describe("Telehealth Booking", () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Booking Tester", uniqueEmail("booking"), "SecurePass1");
    await new NavPage(page).book.click();
  });

  test("E2E-02 book an appointment happy path", async ({ page }) => {
    const book = new BookPage(page);
    await book.bookFirstAvailable("d1", "9:00 AM");
    // bookFirstAvailable already confirms the confirmation card is present
    // (via a raw-DOM check — see BookPage.ts) before returning, so by this
    // point the element is stable and these content checks are reliable.
    await expect(page.getByTestId("appointment-confirmation-detail")).toContainText("Dr. Amara Osei");
    await expect(page.getByTestId("appointment-confirmation-detail")).toContainText("9:00 AM");
  });

  test("NEG-06 cannot book without selecting a time slot", async ({ page }) => {
    const book = new BookPage(page);
    await book.doctor("d2").click();
    await book.bookButton.click();
    await expect(page.getByTestId("error-slot")).toContainText("Select a time slot");
  });

  test("DDT-01 booking works for every doctor's first available slot", async ({ page }) => {
    const doctors = [
      { id: "d1", slot: "9:00 AM" },
      { id: "d2", slot: "8:30 AM" },
      { id: "d3", slot: "10:30 AM" },
      { id: "d4", slot: "9:30 AM" },
    ];
    for (const d of doctors) {
      await new NavPage(page).book.click();
      const book = new BookPage(page);
      await book.bookFirstAvailable(d.id, d.slot);
      await book.backHome.click();
    }
  });

  test("REG-01 booked appointment reflects on home dashboard", async ({ page }) => {
    const book = new BookPage(page);
    await book.bookFirstAvailable("d3", "10:30 AM");
    await book.backHome.click();
    await expect(page.getByText("Upcoming visit")).toBeVisible();
    await expect(page.getByText("Dr. Elena Petrova")).toBeVisible();
  });
});
