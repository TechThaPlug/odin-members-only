const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { safeEqual } = require("../utils/secrets");

function showJoin(req, res) {
  res.render("passcode", {
    title: "Join the club",
    heading: "Join the club",
    description:
      "Enter the secret passcode to become a member and see who wrote each message.",
    action: "/join",
    errors: [],
    done: req.user.isMember || req.user.isAdmin,
    doneMessage: "You are already a member.",
  });
}

async function join(req, res) {
  const render = (status, errors, done = false) =>
    res.status(status).render("passcode", {
      title: "Join the club",
      heading: "Join the club",
      description:
        "Enter the secret passcode to become a member and see who wrote each message.",
      action: "/join",
      errors,
      done,
      doneMessage: "Welcome to the club! You can now see every author.",
    });

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return render(
      400,
      result.array().map((error) => error.msg),
    );
  }

  if (!safeEqual(req.body.passcode.trim(), process.env.CLUB_PASSCODE)) {
    return render(403, ["Incorrect passcode."]);
  }

  await db.makeMember(req.user.id);
  render(200, [], true);
}

function showAdmin(req, res) {
  res.render("passcode", {
    title: "Become an admin",
    heading: "Become an admin",
    description:
      "Enter the admin passcode to get permission to delete messages.",
    action: "/admin",
    errors: [],
    done: req.user.isAdmin,
    doneMessage: "You are already an admin.",
  });
}

async function admin(req, res) {
  const render = (status, errors, done = false) =>
    res.status(status).render("passcode", {
      title: "Become an admin",
      heading: "Become an admin",
      description:
        "Enter the admin passcode to get permission to delete messages.",
      action: "/admin",
      errors,
      done,
      doneMessage: "You are now an admin. You can delete messages.",
    });

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return render(
      400,
      result.array().map((error) => error.msg),
    );
  }

  if (!safeEqual(req.body.passcode.trim(), process.env.ADMIN_PASSCODE)) {
    return render(403, ["Incorrect passcode."]);
  }

  await db.makeAdmin(req.user.id);
  render(200, [], true);
}

module.exports = { showJoin, join, showAdmin, admin };
