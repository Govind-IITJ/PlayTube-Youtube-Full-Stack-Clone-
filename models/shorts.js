const mongoose = require("mongoose");
const { Schema } = mongoose;

const shortsSchema = new Schema({
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
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Short", shortsSchema);
