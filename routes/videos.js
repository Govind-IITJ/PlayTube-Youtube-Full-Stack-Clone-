const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user.js");
const Video = require("../models/video.js");
const Short = require("../models/shorts.js");
const CommunityPost = require("../models/communityPost.js");
const Comment = require("../models/comment.js");

const { isUserLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

// SHORTS
router.get(
  "/shorts",
  wrapAsync(async (req, res) => {
    const { shortId } = req.query;

    let shorts = [];

    if (shortId && mongoose.Types.ObjectId.isValid(shortId)) {
      const selectedShort = await Short.findById(shortId)
        .populate("creator", "username profilePic")
        .lean();

      if (selectedShort) {
        const otherShorts = await Short.find({ _id: { $ne: shortId } })
          .sort({ createdAt: -1 })
          .populate("creator", "username profilePic")
          .lean();

        shorts = [selectedShort, ...otherShorts];
      }
    }

    // fallback (no shortId OR invalid OR not found)
    if (shorts.length === 0) {
      shorts = await Short.find()
        .sort({ createdAt: -1 })
        .populate("creator", "username profilePic")
        .lean();
    }

    res.render("videos/shorts.ejs", { videos: shorts });
  }),
);

const categories = [
  "All",
  "Programming",
  "Gaming",
  "Lifestyle",
  "Sports",
  "Music",
  "Travel",
  "Food",
  "Education",
  "Entertainment",
  "Technology",
];

// VIDEOS LIST
router.get(
  "/videos",
  wrapAsync(async (req, res) => {
    const { category = "All" } = req.query;

    let filter = {};
    if (category !== "All") filter.category = category;

    const videos = await Video.find(filter)
      .select("title thumbnail views date creator")
      .sort({ date: -1 })
      .limit(24)
      .populate("creator", "username profilePic")
      .lean();

    res.render("videos/index.ejs", {
      videos,
      categories,
      selectedCategory: category,
    });
  }),
);

// SEARCH
router.get(
  "/videos/search",
  wrapAsync(async (req, res) => {
    const query = req.query.q || "";

    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    }).populate("creator");

    res.render("videos/search.ejs", { videos, query });
  }),
);

// VIDEO SHOW
router.get(
  "/video/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid video");
      return res.redirect("/videos");
    }

    const video = await Video.findById(id)
      .populate("creator")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username profilePic",
        },
      });

    if (!video) {
      req.flash("error", "Video not found");
      return res.redirect("/videos");
    }

    let relatedVideos = await Video.find({
      category: video.category,
      _id: { $ne: video._id },
    })
      .sort({ date: -1 })
      .populate("creator");

    if (relatedVideos.length < 2) {
      const extraVideos = await Video.find({
        category: "Gaming",
        _id: { $ne: video._id },
      })
        .sort({ date: -1 })
        .populate("creator");

      // prepend extraVideos to relatedVideos
      relatedVideos = [...extraVideos, ...relatedVideos];
    }

    res.render("videos/show.ejs", {
      video,
      videos: relatedVideos,
    });
  }),
);

//comments
router.post(
  "/videos/:id/comments",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const redirectUrl = req.get("referer") || `/video/${id}`;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid video");
      return res.redirect(redirectUrl);
    }

    const content = req.body.content?.trim();
    if (!content) {
      req.flash("error", "Comment cannot be empty");
      return res.redirect(redirectUrl);
    }

    const video = await Video.findById(id);
    if (!video) {
      req.flash("error", "Video not found");
      return res.redirect(redirectUrl);
    }

    const comment = new Comment({
      content,
      author: req.user._id,
    });

    await comment.save();

    video.comments.push(comment._id);
    await video.save();

    req.flash("success", "Comment added");
    res.redirect(redirectUrl);
  }),
);

router.delete(
  "/videos/:videoId/comments/:commentId",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { videoId, commentId } = req.params;

    await Video.findByIdAndUpdate(videoId, {
      $pull: { comments: commentId },
    });

    await Comment.findByIdAndDelete(commentId);

    req.flash("success", "Comment removed");
    res.redirect(`/video/${videoId}`);
  }),
);

// DELETE VIDEO
router.delete(
  "/videos/:id",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      req.flash("error", "Video not found");
      return res.redirect("/videos");
    }

    if (!video.creator.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect(`/users/${video.creator}`);
    }

    await Video.findByIdAndDelete(id);
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { videos: id },
    });

    req.flash("success", "Video deleted");
    res.redirect(`/users/${video.creator}`);
  }),
);

// DELETE SHORT
router.delete(
  "/shorts/:id",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const short = await Short.findById(id);
    if (!short) {
      req.flash("error", "Short not found");
      return res.redirect("/videos");
    }

    if (!short.creator.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect(`/users/${short.creator}`);
    }

    await Short.findByIdAndDelete(id);

    req.flash("success", "Short deleted");
    res.redirect(`/users/${short.creator}`);
  }),
);

// DELETE COMMUNITY POST
router.delete(
  "/posts/:id",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) {
      req.flash("error", "Post not found");
      return res.redirect(`/users/${req.user._id}`);
    }

    if (!post.creator.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect(`/users/${req.user._id}`);
    }

    await CommunityPost.findByIdAndDelete(id);

    req.flash("success", "Post deleted");
    res.redirect(`/users/${req.user._id}`);
  }),
);

module.exports = router;
