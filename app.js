require("dotenv").config();

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const pool = require("./db/pool");
const routes = require("./routes");

require("./config/passport");

const required = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "CLUB_PASSCODE",
  "ADMIN_PASSCODE",
];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.disable("x-powered-by");

if (isProduction) {
  app.set("trust proxy", 1);
}

app.locals.formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// ---------- Middleware (the order matters) ----------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new pgSession({ pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(passport.session());

// Available in every view
app.use((req, res, next) => {
  res.locals.currentUser = req.user ?? null;
  next();
});

// ---------- Routes ----------
app.use("/", routes);

// ---------- Fallbacks ----------
app.use((req, res) => {
  res.status(404).render("404", { title: "Page not found" });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).render("error", { title: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Members Only - listening on port ${PORT}!`);
});
