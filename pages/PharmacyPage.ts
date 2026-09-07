import { Page, Locator } from "@playwright/test";

export class PharmacyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get search(): Locator {
    return this.page.getByTestId("input-medicine-search");
  }

  medicineCard(id: string): Locator {
    return this.page.getByTestId(`medicine-${id}`);
  }

  addButton(id: string): Locator {
    return this.page.getByTestId(`btn-add-${id}`);
  }

  get viewCart(): Locator {
    return this.page.getByTestId("btn-view-cart");
  }

  qty(id: string): Locator {
    return this.page.getByTestId(`qty-${id}`);
  }

  incQty(id: string): Locator {
    return this.page.getByTestId(`btn-inc-${id}`);
  }

  decQty(id: string): Locator {
    return this.page.getByTestId(`btn-dec-${id}`);
  }

  get proceedCheckout(): Locator {
    return this.page.getByTestId("btn-proceed-checkout");
  }

  async fillShipping(address: string, city: string, zip: string) {
    await this.page.getByTestId("input-address").fill(address);
    await this.page.getByTestId("input-city").fill(city);
    await this.page.getByTestId("input-zip").fill(zip);
  }

  async fillPayment(card: string, expiry: string, cvv: string) {
    await this.page.getByTestId("input-card").fill(card);
    await this.page.getByTestId("input-expiry").fill(expiry);
    await this.page.getByTestId("input-cvv").fill(cvv);
  }

  get rxUpload(): Locator {
    return this.page.getByTestId("input-rx-upload");
  }

  get placeOrder(): Locator {
    return this.page.getByTestId("btn-place-order");
  }

  get orderConfirmation(): Locator {
    return this.page.getByTestId("order-confirmation");
  }
}
