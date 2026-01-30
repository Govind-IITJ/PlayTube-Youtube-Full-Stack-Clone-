const Comment = require("./models/comment.js");
const Video = require("./models/video.js");

const isUserLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    console.log("url is", req.originalUrl);
    return res.redirect("/login");
  }
  next();
};


module.exports = { isUserLoggedIn};

