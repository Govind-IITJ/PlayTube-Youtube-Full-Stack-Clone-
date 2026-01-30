const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  thumbnail: {
    type: String,
    required: true,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png",
  },
  video: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

videoSchema.pre("findOneAndDelete", async function () {
  const video = await this.model.findOne(this.getQuery());
  if (video?.comments?.length) {
    await Comment.deleteMany({ _id: { $in: video.comments } });
  }
});


const Video = mongoose.model("Video", videoSchema);
module.exports = Video;

