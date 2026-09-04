import { Page, Locator } from "@playwright/test";

export class TrialsPage {
  readonly page: Page;
  readonly age: Locator;
  readonly condition: Locator;
  readonly findButton: Locator;
  readonly resultCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.age = page.getByTestId("input-age");
    this.condition = page.getByTestId("select-condition");
    this.findButton = page.getByTestId("btn-find-trials");
    this.resultCount = page.getByTestId("trials-result-count");
  }

  trialCard(trialId: string): Locator {
    return this.page.getByTestId(`trial-${trialId}`);
  }
  interestButton(trialId: string): Locator {
    return this.page.getByTestId(`btn-interest-${trialId}`);
  }

  async findMatches(age: string, condition: string) {
    await this.age.fill(age);
    await this.condition.selectOption(condition);
    await this.findButton.click();
  }
}
