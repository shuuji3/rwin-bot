// https://docs.cypress.io/api/introduction/api.html

describe('Home', () => {
  it('has the app name', () => {
    cy.visit('/');
    cy.contains('h1', 'Rwin-bot');
  });

  it('has a GitHub link on the nav bar', () => {
    cy.visit('/');
    cy.contains('header', 'GitHub');
  });
});
