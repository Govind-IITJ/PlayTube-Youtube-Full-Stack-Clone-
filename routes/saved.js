const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user.js");
const Video = require("../models/video.js");
const Short = require("../models/shorts.js");
const CommunityPost = require("../models/communityPost.js");

const { isUserLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

// SAVED VIDEOS
// get saved videos
router.get(
  "/users/savedvideos",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
      .populate({
        path: "savedVideos",
        populate: { path: "creator" },
      });

    res.render("users/savedVideos.ejs", {
      videos: user.savedVideos,
    });
  }),
);

// add / remove video from saved list
router.put(
  "/users/savedvideos/:videoId",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { videoId } = req.params;
    const redirectUrl = req.get("referer") || "/users/savedposts";

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      req.flash("error", "Invalid video");
      return res.redirect(redirectUrl);
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedVideos.some((v) => v.toString() === videoId);

    await User.findByIdAndUpdate(req.user._id, {
      [isSaved ? "$pull" : "$addToSet"]: { savedVideos: videoId },
    });

    req.flash("success", isSaved ? "Removed from saved videos" : "Video saved");
    res.redirect(redirectUrl);
  }),
);

// SAVED POSTS
// get saved posts
router.get(
  "/users/savedposts",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: { path: "creator" },
    });

    res.render("users/savedPosts.ejs", {
      posts: user.savedPosts,
    });
  }),
);

// add / remove post from saved list
router.put(
  "/users/savedposts/:postId",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { postId } = req.params;
    const redirectUrl = req.get("referer") || "/users/savedposts";

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      req.flash("error", "Invalid post");
      return res.redirect(redirectUrl);
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.some((p) => p.toString() === postId);

    await User.findByIdAndUpdate(req.user._id, {
      [isSaved ? "$pull" : "$addToSet"]: { savedPosts: postId },
    });

    req.flash("success", isSaved ? "Post removed" : "Post saved");
    res.redirect(redirectUrl);
  }),
);

// FOLLOWINGS
// get followings list
router.get(
  "/users/followings",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate("followings");
    res.render("users/followings.ejs", {
      followings: user.followings,
    });
  }),
);

// follow / unfollow a channel
router.put(
  "/users/followings/:followId",
  isUserLoggedIn,
  wrapAsync(async (req, res) => {
    const { followId } = req.params;
    const redirectUrl = req.get("referer") || "/videos";

    if (!mongoose.Types.ObjectId.isValid(followId)) {
      req.flash("error", "Invalid user");
      return res.redirect(redirectUrl);
    }

    if (followId === req.user._id.toString()) {
      req.flash("error", "You cannot follow yourself");
      return res.redirect(redirectUrl);
    }

    const user = await User.findById(req.user._id);
    const isFollowing = user.followings.some((f) => f.toString() === followId);

    await User.findByIdAndUpdate(req.user._id, {
      [isFollowing ? "$pull" : "$addToSet"]: { followings: followId },
    });

    req.flash(
      "success",
      isFollowing ? "Unfollowed channel" : "Following channel",
    );
    res.redirect(redirectUrl);
  }),
);

router.get(
  "/users/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid user");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ExpressError(404, "User not found");
    }

    const videos = await Video.find({ creator: user._id }).sort({
      date: -1,
    });

    const posts = await CommunityPost.find({ creator: user._id }).sort({
      createdAt: -1,
    });

    const shorts = await Short.find({ creator: user._id }).sort({
      createdAt: -1,
    });

    res.render("users/profile.ejs", {
      user,
      videos,
      posts,
      shorts,
    });
  }),
);

module.exports = router;
