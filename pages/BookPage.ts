import { Page, Locator, expect } from "@playwright/test";

export class BookPage {
  readonly page: Page;
  readonly bookButton: Locator;
  readonly reason: Locator;
  readonly confirmation: Locator;
  readonly backHome: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookButton = page.getByTestId("btn-book-appointment");
    this.reason = page.getByTestId("input-reason");
    this.confirmation = page.getByTestId("appointment-confirmation");
    this.backHome = page.getByTestId("btn-back-home");
  }

  doctor(id: string): Locator {
    return this.page.getByTestId(`doctor-${id}`);
  }

  /** slot label e.g. "9:00 AM" -> testid "slot-900AM" */
  slot(label: string): Locator {
    const id = label.replace(/[^0-9A-Za-z]/g, "");
    return this.page.getByTestId(`slot-${id}`);
  }

  async bookFirstAvailable(doctorId: string, slotLabel: string) {
    await this.doctor(doctorId).click();
    const slotBtn = this.slot(slotLabel);
    await slotBtn.click();
    // Wait for React's setSlot() state update to actually commit before
    // clicking Book — clicking immediately after was a real, reproducible
    // race (confirmed by comparing this exact flow with and without a
    // pause: with a pause it always succeeds, without it always fails).
    // aria-pressed reflects the app's real selection state, so this is a
    // genuine synchronization point rather than an arbitrary sleep.
    await expect(slotBtn).toHaveAttribute("aria-pressed", "true");

    // Capture the exact API response for this click, whatever it is —
    // this is the definitive way to see whether booking succeeded,
    // returned an error, or the request never fired at all.
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
      console.log("[bookFirstAvailable] No /api/appointments response observed within 12s after clicking Book — the request may never have fired.");
    }

    // Also dump what's actually on screen right now, in case it's an
    // error message rather than a hang.
    const bodyText = await this.page.locator("body").innerText().catch(() => "(could not read body text)");
    console.log("[bookFirstAvailable] Page text after click:", bodyText.slice(0, 400));
  }
}
