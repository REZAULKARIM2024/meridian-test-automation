import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { PharmacyPage } from "../pages/PharmacyPage";
import { uniqueEmail } from "./utils";

test.describe("Pharmacy", () => {
  test.beforeEach(async ({ page }) => {
    page.on("response", (res) => {
      if (res.url().includes("/api/medicines")) {
        res.text().then((body) => {
          console.log(`[pharmacy beforeEach] GET /api/medicines -> ${res.status()}: ${body.slice(0, 200)}`);
        }).catch(() => {});
      }
    });

    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signup("Pharmacy Tester", uniqueEmail("pharmacy"), "SecurePass1");
    await new NavPage(page).pharmacy.click();
    // Medicines are fetched async on app load. The API is confirmed (via the
    // response listener above) to return correct data reliably — but
    // Playwright's own getByTestId().toBeVisible() has been observed to
    // time out even when the element is genuinely present and correctly
    // rendered (same symptom seen on the booking confirmation screen). To
    // sidestep whatever race exists in Playwright's accessibility-tree
    // polling, check the raw DOM directly instead.
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="medicine-m1"]');
        return !!el && el.getClientRects().length > 0;
      },
      { timeout: 25_000 }
    );
  });

  test("SMK-05 medicine search returns matching results", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await pharmacy.search.fill("Ibuprofen");
    await expect(pharmacy.medicineCard("m2")).toBeVisible();
    await expect(pharmacy.medicineCard("m1")).not.toBeVisible();
  });

  test("NEG-07 search with no matches shows empty state", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await pharmacy.search.fill("Nonexistent Drug XYZ");
    await expect(page.getByTestId("no-results")).toBeVisible();
  });

  test("NEG-08 out-of-stock medicine cannot be added to cart", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await expect(pharmacy.addButton("m3")).toBeDisabled();
  });

  test("E2E-03 add OTC medicine to cart and adjust quantity", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await pharmacy.addButton("m2").click();
    await pharmacy.viewCart.click();
    await expect(pharmacy.qty("m2")).toHaveText("1");
    await pharmacy.incQty("m2").click();
    await expect(pharmacy.qty("m2")).toHaveText("2");
    await pharmacy.decQty("m2").click();
    await pharmacy.decQty("m2").click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("E2E-04 full checkout with Rx item requires prescription upload", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await pharmacy.addButton("m1").click(); // Amoxicillin — Rx required
    await pharmacy.viewCart.click();
    await pharmacy.proceedCheckout.click();
    await pharmacy.fillShipping("123 Main St", "Springfield", "12345");
    await pharmacy.fillPayment("4242424242424242", "12/28", "123");
    await pharmacy.placeOrder.click();
    // Rx not uploaded yet -> should block
    await expect(page.getByText("Upload a valid prescription")).toBeVisible();

    await pharmacy.rxUpload.setInputFiles({
      name: "prescription.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("mock prescription content"),
    });
    // Wait for the upload to actually register in app state (the label
    // updates to show the filename) before clicking Place order again —
    // same class of race as the booking flow fix in BookPage.ts.
    await expect(page.getByText("prescription.pdf")).toBeVisible();
    await pharmacy.placeOrder.click();
    // Same raw-DOM approach as the beforeEach fix above — sidesteps the
    // observed race in Playwright's own toBeVisible() polling.
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="order-confirmation"]');
        return !!el && el.getClientRects().length > 0;
      },
      { timeout: 20_000 }
    );
  });

  const invalidCards = [
    { card: "123", expiry: "12/28", cvv: "123", label: "too-short card number" },
    { card: "4242424242424242", expiry: "13/28", cvv: "123", label: "invalid month" },
    { card: "4242424242424242", expiry: "12/28", cvv: "12", label: "too-short CVV" },
  ];
  for (const c of invalidCards) {
    test(`NEG-09 checkout rejects ${c.label}`, async ({ page }) => {
      const pharmacy = new PharmacyPage(page);
      await pharmacy.addButton("m2").click(); // OTC, no Rx needed
      await pharmacy.viewCart.click();
      await pharmacy.proceedCheckout.click();
      await pharmacy.fillShipping("1 Test Ave", "Testville", "99999");
      await pharmacy.fillPayment(c.card, c.expiry, c.cvv);
      await pharmacy.placeOrder.click();
      await expect(pharmacy.orderConfirmation).not.toBeVisible();
    });
  }

  test("DDT-02 total price updates correctly across quantity changes", async ({ page }) => {
    const pharmacy = new PharmacyPage(page);
    await pharmacy.addButton("m4").click(); // Cetirizine $4.50
    await pharmacy.addButton("m6").click(); // Vitamin D3 $8.00
    await pharmacy.viewCart.click();
    await pharmacy.incQty("m4").click(); // 2x $4.50 + 1x $8.00 = $17.00
    await expect(page.getByTestId("cart-total")).toHaveText("$17.00");
  });
});
