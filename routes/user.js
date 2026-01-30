const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { userSignupJoiSchema } = require("../schema.js");

const getRedirectUrl = (req, fallback = "/videos") => {
  const referer = req.get("referer");
  if (!referer) return fallback;
  if (referer.includes("/login") || referer.includes("/signup")) {
    return fallback;
  }
  return referer;
};

const validateSignup = (req, res, next) => {
  const { error } = userSignupJoiSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    req.flash("error", messages);
    console.log(error);
    return res.redirect("/signup");
  }

  next();
};

const isAlreadyLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already logged in");
    return res.redirect(getRedirectUrl(req, "/videos"));
  }
  next();
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You are not logged in");
    return res.redirect(getRedirectUrl(req, "/videos"));
  }
  next();
};

router.get("/signup", isAlreadyLoggedIn, (req, res) => {
  const returnTo = req.get("referer") || "/videos";
  res.render("users/signup.ejs", { returnTo });
});

router.post(
  "/signup",
  isAlreadyLoggedIn,
  upload.fields([
    { name: "profileUrl", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  validateSignup,
  wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    const DEFAULT_PROFILE_PIC =
      "https://res.cloudinary.com/dd8o5muke/image/upload/v1769186764/youtube_DEV/pnnwxup58cu2chnrxhsn.jpg";
    const DEFAULT_BG_IMAGE =
      "https://res.cloudinary.com/dd8o5muke/image/upload/v1769186771/youtube_DEV/mtsfkhizzqwi1iaeabwv.png";

    const profilePic = req.files?.profileUrl?.[0]?.path || DEFAULT_PROFILE_PIC;
    const backgroundImage =
      req.files?.backgroundImage?.[0]?.path || DEFAULT_BG_IMAGE;

    const newUser = new User({
      username,
      email,
      profilePic,
      backgroundImage,
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      const redirectUrl = req.body.returnTo || "/videos";
      req.flash("success", "Welcome to PlayTube 👋");
      res.redirect(redirectUrl);
    });
  }),
);

router.get("/login", isAlreadyLoggedIn, (req, res) => {
  const returnTo = req.get("referer") || "/videos";
  res.render("users/login.ejs", { returnTo });
});

router.post(
  "/login",
  isAlreadyLoggedIn,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirectUrl = req.body.returnTo || "/videos";
    req.flash("success", "Welcome back 👋");
    res.redirect(redirectUrl);
  }
);

router.get("/logout", isNotLoggedIn, (req, res, next) => {
  const redirectUrl = getRedirectUrl(req, "/videos");
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have logged out successfully");
    res.redirect(redirectUrl);
  });
});


router.use((err, req, res, next) => {
  const { message = "Something went wrong" } = err;
  req.flash("error", message);
  res.redirect(getRedirectUrl(req, "/videos"));
});

module.exports = router;
