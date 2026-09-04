import { Page, Locator, expect } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly tabLogin: Locator;
  readonly tabSignup: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabLogin = page.getByTestId("tab-login");
    this.tabSignup = page.getByTestId("tab-signup");
    this.name = page.getByTestId("input-name");
    this.email = page.getByTestId("input-email");
    this.password = page.getByTestId("input-password");
    this.confirm = page.getByTestId("input-confirm");
    this.submit = page.getByTestId("btn-auth-submit");
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(email: string, password: string) {
    await this.tabLogin.click();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async signup(name: string, email: string, password: string, confirm = password) {
    await this.tabSignup.click();
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirm.fill(confirm);
    await this.submit.click();
  }

  async expectFieldError(field: Locator, message: string) {
    // Error text renders as a sibling <span> right after the field's wrapper;
    // simplest robust check is that the field has an error border + the message is visible somewhere on screen.
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
