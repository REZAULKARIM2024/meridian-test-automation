// Cypress equivalent of tests/booking.spec.ts (Playwright).
// Uses the exact same data-testid selectors as the Playwright suite, so both
// frameworks can run against the same app without touching MeridianHealthApp.jsx.
//
// Setup (not included in this scaffold — Playwright is the primary runner):
//   npm install -D cypress
//   npx cypress open
//   Point cypress.config.js baseUrl to http://localhost:5173
//   Move/copy this file into cypress/e2e/

describe("Telehealth Booking (Cypress)", () => {
  beforeEach(() => {
    const email = `cypress.tester.${Date.now()}@example.com`;
    cy.visit("/");
    cy.getByTestId("tab-signup").click();
    cy.getByTestId("input-name").type("Cypress Tester");
    cy.getByTestId("input-email").type(email);
    cy.getByTestId("input-password").type("SecurePass1");
    cy.getByTestId("input-confirm").type("SecurePass1");
    cy.getByTestId("btn-auth-submit").click();
    cy.getByTestId("nav-book").click();
  });

  it("E2E-02 books an appointment happy path", () => {
    cy.getByTestId("doctor-d1").click();
    cy.getByTestId("slot-900AM").click();
    cy.getByTestId("btn-book-appointment").click();
    cy.getByTestId("appointment-confirmation").should("be.visible");
    cy.getByTestId("appointment-confirmation-detail").should("contain.text", "Dr. Amara Osei");
  });

  it("NEG-06 cannot book without selecting a time slot", () => {
    cy.getByTestId("doctor-d2").click();
    cy.getByTestId("btn-book-appointment").click();
    cy.getByTestId("error-slot").should("contain.text", "Select a time slot");
  });
});

// Add this custom command in cypress/support/commands.js:
// Cypress.Commands.add("getByTestId", (id) => cy.get(`[data-testid="${id}"]`));
