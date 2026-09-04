import { Page, Locator } from "@playwright/test";

export class NavPage {
  readonly page: Page;
  readonly home: Locator;
  readonly book: Locator;
  readonly pharmacy: Locator;
  readonly trials: Locator;
  readonly profile: Locator;
  readonly toggleMobile: Locator;
  readonly toggleDesktop: Locator;
  readonly appFrame: Locator;

  constructor(page: Page) {
    this.page = page;
    this.home = page.getByTestId("nav-home");
    this.book = page.getByTestId("nav-book");
    this.pharmacy = page.getByTestId("nav-pharmacy");
    this.trials = page.getByTestId("nav-trials");
    this.profile = page.getByTestId("nav-profile");
    this.toggleMobile = page.getByTestId("toggle-mobile");
    this.toggleDesktop = page.getByTestId("toggle-desktop");
    this.appFrame = page.getByTestId("app-frame");
  }
}
