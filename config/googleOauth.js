const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://playtube-3t5u.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            username: profile.displayName
              .replace(/\s+/g, "")
              .toLowerCase(), 
            email: email,
            passkey: null, 
            description: "",
            profilePic: profile.photos?.[0]?.value || "/images/default-user.png",
            backgroundImage: "/images/default-banner.png",
            videos: [],
            communityPosts: [],
            watchHistory: [],
            savedVideos: [],
            savedPosts: [],
            followingChannels: [],
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Store user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get user from id
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
