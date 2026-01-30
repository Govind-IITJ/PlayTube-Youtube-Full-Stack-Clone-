if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
app.set("trust proxy", 1);
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

// MODELS
const Video = require("./models/video.js");
const Short = require("./models/shorts.js");
const Comment = require("./models/comment.js");
const CommunityPost = require("./models/communityPost.js");
const User = require("./models/user.js");

// VIEW ENGINE
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE (basic)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// DATABASE CONNECTION
const dbUrl = process.env.ATLASDB_URL;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.log("MongoDB connection error");
    console.log(err);
  });

// SESSION & AUTH
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// SESSION STORE
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", err => {
  console.log("SESSION STORE ERROR", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

require("./config/googleOauth");

// MULTER / UPLOADS
const multer = require("multer");
const { storage } = require("./cloudConfig.js");

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// GLOBAL LOCALS
app.use((req, res, next) => {
  res.locals.query = req.query.q || "";
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  const skipPaths = [
    "/login",
    "/signup",
    "/auth/google",
    "/auth/google/callback",
    "/logout",
  ];

  if (
    req.method === "GET" &&
    !skipPaths.some(path => req.path.startsWith(path)) &&
    !req.path.startsWith("/favicon")
  ) {
    req.session.returnTo = req.originalUrl;
  }

  next();
});

// ROUTES
const videosRoute = require("./routes/videos.js");
const savedRoute = require("./routes/saved.js");
const uploadRoute = require("./routes/upload.js");
const userRoute = require("./routes/user.js");
const authRoute = require("./routes/auth.js");

app.use("/", videosRoute);
app.use("/", savedRoute);
app.use("/", uploadRoute);
app.use("/", authRoute);
app.use("/", userRoute);

app.get("/", (req, res) => {
  res.redirect("/videos");
});

// 404 HANDLER
app.use((req, res) => {
  const requestedUrl = req.originalUrl;

  req.flash(
    "error",
    `Page not found`
  );

  res.redirect("/videos");
});


// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
