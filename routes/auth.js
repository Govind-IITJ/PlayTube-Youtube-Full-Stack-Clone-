const express = require("express");
const passport = require("passport");
const router = express.Router();
const mongoose = require("mongoose");

// Google login
router.get("/auth/google", (req, res, next) => {
  const returnTo =
    req.query.returnTo ||
    req.get("referer") ||
    "/videos";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: encodeURIComponent(returnTo),
  })(req, res, next);
});

// Google callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirectUrl =
      req.query.state
        ? decodeURIComponent(req.query.state)
        : "/videos";

    req.flash("success", "Welcome back 👋");
    res.redirect(redirectUrl);
  }
);

module.exports = router;
