describe("Login", () => {
  it("should login user correctly", () => {
    cy.createUser().then((user) => {
      cy.visit("/login")
        .get("input[name=username]")
        .type(user.username)
        .get("input[name=password]")
        .type(user.password)
        .get("input[type=submit")
        .click()
        .url()
        .should("include", "/")
    })
  })
})
