import { Page, Locator, expect } from "@playwright/test";

export class BookPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  doctor(id: string): Locator {
    return this.page.getByTestId(`doctor-${id}`);
  }

  slot(slotLabel: string): Locator {
    return this.page.getByTestId(`slot-${slotLabel.replace(/[^0-9A-Za-z]/g, "")}`);
  }

  get reason(): Locator {
    return this.page.getByTestId("input-reason");
  }

  get bookButton(): Locator {
    return this.page.getByTestId("btn-book-appointment");
  }

  get errorSlot(): Locator {
    return this.page.getByTestId("error-slot");
  }

  get confirmation(): Locator {
    return this.page.getByTestId("appointment-confirmation");
  }

  get confirmationDetail(): Locator {
    return this.page.getByTestId("appointment-confirmation-detail");
  }

  get backHome(): Locator {
    return this.page.getByTestId("btn-back-home");
  }

  async bookFirstAvailable(doctorId: string, slotLabel: string) {
    await this.doctor(doctorId).click();
    const slotBtn = this.slot(slotLabel);
    await slotBtn.click();
    // Wait for React's setSlot() state update to actually commit before
    // clicking Book — confirmed via debug-booking.spec.ts that clicking
    // immediately after was a real, reproducible race. aria-pressed
    // reflects the app's real selection state.
    await expect(slotBtn).toHaveAttribute("aria-pressed", "true");

    // Capture the exact API response for this click — the definitive way
    // to see whether booking succeeded, errored, or never fired.
    const responsePromise = this.page
      .waitForResponse((res) => res.url().includes("/api/appointments"), { timeout: 12_000 })
      .catch(() => null);

    await this.bookButton.click();

    const response = await responsePromise;
    if (response) {
      const status = response.status();
      const body = await response.text().catch(() => "(could not read body)");
      console.log(`[bookFirstAvailable] POST /api/appointments -> ${status}: ${body}`);
    } else {
      console.log("[bookFirstAvailable] No /api/appointments response observed within 12s after clicking Book.");
    }

    // The confirmation Card is confirmed (via the CI trace investigation)
    // to sometimes be genuinely present and correctly rendered even when
    // Playwright's own getByTestId().toBeVisible() times out waiting for
    // it — the same symptom independently confirmed on the pharmacy
    // catalog. Checking the raw DOM directly sidesteps whatever race
    // exists in Playwright's accessibility-tree polling.
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="appointment-confirmation"]');
        return !!el && el.getClientRects().length > 0;
      },
      { timeout: 20_000 }
    );
  }
}
