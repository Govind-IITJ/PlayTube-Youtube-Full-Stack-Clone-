const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profilePic: {
      type: String,
      default: "/images/defaultuser.png",
    },
    backgroundImage: {
      type: String,
      default: "/images/defaultcover.png",
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    communityPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost",
      },
    ],
    savedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost",
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
