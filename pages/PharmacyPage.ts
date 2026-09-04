import { Page, Locator } from "@playwright/test";

export class PharmacyPage {
  readonly page: Page;
  readonly search: Locator;
  readonly viewCart: Locator;
  readonly proceedCheckout: Locator;
  readonly rxUpload: Locator;
  readonly address: Locator;
  readonly city: Locator;
  readonly zip: Locator;
  readonly card: Locator;
  readonly expiry: Locator;
  readonly cvv: Locator;
  readonly placeOrder: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.search = page.getByTestId("input-medicine-search");
    this.viewCart = page.getByTestId("btn-view-cart");
    this.proceedCheckout = page.getByTestId("btn-proceed-checkout");
    this.rxUpload = page.getByTestId("input-rx-upload");
    this.address = page.getByTestId("input-address");
    this.city = page.getByTestId("input-city");
    this.zip = page.getByTestId("input-zip");
    this.card = page.getByTestId("input-card");
    this.expiry = page.getByTestId("input-expiry");
    this.cvv = page.getByTestId("input-cvv");
    this.placeOrder = page.getByTestId("btn-place-order");
    this.orderConfirmation = page.getByTestId("order-confirmation");
  }

  addButton(medicineId: string): Locator {
    return this.page.getByTestId(`btn-add-${medicineId}`);
  }
  medicineCard(medicineId: string): Locator {
    return this.page.getByTestId(`medicine-${medicineId}`);
  }
  incQty(medicineId: string): Locator {
    return this.page.getByTestId(`btn-inc-${medicineId}`);
  }
  decQty(medicineId: string): Locator {
    return this.page.getByTestId(`btn-dec-${medicineId}`);
  }
  qty(medicineId: string): Locator {
    return this.page.getByTestId(`qty-${medicineId}`);
  }

  async fillShipping(address: string, city: string, zip: string) {
    await this.address.fill(address);
    await this.city.fill(city);
    await this.zip.fill(zip);
  }

  async fillPayment(card: string, expiry: string, cvv: string) {
    await this.card.fill(card);
    await this.expiry.fill(expiry);
    await this.cvv.fill(cvv);
  }
}
