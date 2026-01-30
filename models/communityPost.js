const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communityPostSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },

  image: {
    type: String, 
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
