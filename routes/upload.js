const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const User = require("../models/user.js");
const Video = require("../models/video.js");
const Short = require("../models/shorts.js");
const CommunityPost = require("../models/communityPost.js");

const { isUserLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const {
  videoJoiSchema,
  shortsJoiSchema,
  communityPostJoiSchema,
} = require("../schema.js");

// VALIDATION MIDDLEWARE
const validateVideo = (req, res, next) => {
  const { error } = videoJoiSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    req.flash("error", msg);
    const redirectUrl = req.get("referer") || "/upload/video";
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
  }

  next();
};

const validateShort = (req, res, next) => {
  const { error } = shortsJoiSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    req.flash("error", msg);
    const redirectUrl = req.get("referer") || "/upload/short";
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
  }

  next();
};

const validateCommunityPost = (req, res, next) => {
  const { error } = communityPostJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    req.flash("error", msg);
    const redirectUrl = req.get("referer") || "/upload/post";
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
  }
  next();
};

// VIDEO UPLOAD

router.get("/upload/video", isUserLoggedIn, (req, res) => {
  res.render("uploads/video.ejs");
});

router.post(
  "/upload/video",
  isUserLoggedIn,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validateVideo,
  wrapAsync(async (req, res) => {
    const videoFile = req.files?.video?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!videoFile || !thumbFile) {
      req.flash("error", "Video and thumbnail are required");
      return res.redirect("/upload/video");
    }

    const newVideo = new Video({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      video: videoFile.path,
      thumbnail: thumbFile.path,
      creator: req.user._id,
    });

    await newVideo.save();

    req.flash("success", "Video uploaded successfully 🎉");
    res.redirect(`/video/${newVideo._id}`);
  }),
);

// SHORT UPLOAD

router.get("/upload/short", isUserLoggedIn, (req, res) => {
  res.render("uploads/shorts.ejs");
});

router.post(
  "/upload/short",
  isUserLoggedIn,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validateShort,
  wrapAsync(async (req, res) => {
    const videoFile = req.files?.video?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
      req.flash("error", "Short video file is required");
      return res.redirect("/upload/short");
    }

    const newShort = new Short({
      title: req.body.title,
      description: req.body.description,
      video: videoFile.path,
      thumbnail: thumbFile?.path,
      creator: req.user._id,
    });

    await newShort.save();

    req.flash("success", "Short uploaded successfully 🎬");
    res.redirect("/shorts");
  }),
);

// COMMUNITY POST

router.get("/upload/post", isUserLoggedIn, (req, res) => {
  res.render("uploads/post.ejs");
});

router.post(
  "/upload/post",
  isUserLoggedIn,
  upload.single("image"),
  validateCommunityPost,
  wrapAsync(async (req, res) => {
    const post = new CommunityPost({
      content: req.body.content,
      creator: req.user._id,
    });
    if (req.file) {
      post.image = req.file.path;
    } else {
      req.flash("error", "Image file is required");
      return res.redirect("/upload/post");
    }
    await post.save();
    req.flash("success", "Post published successfully ✨");
    res.redirect("/videos");
  }),
);

// ERROR HANDLER
router.use((err, req, res, next) => {
  // Multer file size error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "File size exceeds 10 MB limit");
      return res.redirect(req.get("referer") || "/");
    }
  }
  const { statusCode = 500, message = "Something went wrong" } = err;
  req.flash("error", message);
  res.redirect(req.get("referer") || "/");
});

module.exports = router;
