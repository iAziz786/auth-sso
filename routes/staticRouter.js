const { Router } = require("express");

const staticRouter = Router();

staticRouter.route("/").get((req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.render("index", {
      name,
      username,
      email
    });
  }
  res.redirect("/login");
});

staticRouter.route("/login").get((req, res) => {
  res.render("login");
});

staticRouter.route("/signup").get((req, res) => {
  res.render("signup");
});

module.exports = staticRouter;
