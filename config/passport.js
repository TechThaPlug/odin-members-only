const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

// Used so a wrong email takes about as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.findUserByUsername(username);
      const match = await bcrypt.compare(
        password,
        user ? user.password : DUMMY_HASH,
      );

      if (!user || !match) {
        return done(null, false, { message: "Incorrect email or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

// The session stores only the user's id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// On each request, load the user (without the password hash)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id);
    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
