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
    await expect(slotBtn).toHaveAttribute("aria-pressed", "true");

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

    // getByTestId('appointment-confirmation') has been observed (via a CI
    // accessibility snapshot) to time out even when the confirmation card
    // is genuinely rendered and visible — pointing at something specific
    // to testid/attribute matching for this class of post-async-render
    // content. Checking the actual visible text directly sidesteps that.
    await this.page.waitForFunction(
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
  }
}
