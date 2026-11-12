const bcrypt = require("bcryptjs");
const passport = require("passport");
const { validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

const BCRYPT_ROUNDS = 10;

const clean = (value) => String(value ?? "").trim();

function showSignUp(req, res) {
  res.render("sign-up", {
    title: "Sign up",
    errors: [],
    values: { firstName: "", lastName: "", username: "" },
  });
}

async function signUp(req, res, next) {
  const result = validationResult(req);
  const errors = result.array().map((error) => error.msg);

  const values = {
    firstName: clean(req.body.firstName),
    lastName: clean(req.body.lastName),
    username: clean(req.body.username),
  };

  if (result.isEmpty()) {
    const data = matchedData(req);

    try {
      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

      const user = await db.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        passwordHash,
      });

      // Log them in right away, then send them to the join page
      return req.login(user, (error) => {
        if (error) {
          return next(error);
        }
        res.redirect("/join");
      });
    } catch (error) {
      // 23505 = unique violation: that email is already registered
      if (error.code !== "23505") {
        throw error;
      }
      errors.push("That email is already registered.");
    }
  }

  res.status(400).render("sign-up", { title: "Sign up", errors, values });
}

function showLogIn(req, res) {
  const messages = req.session.messages ?? [];
  req.session.messages = [];

  res.render("log-in", { title: "Log in", messages });
}

const logIn = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureMessage: true,
});

function logOut(req, res, next) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/");
  });
}

module.exports = { showSignUp, signUp, showLogIn, logIn, logOut };
