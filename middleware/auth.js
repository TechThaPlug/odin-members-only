function requireLogin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/log-in");
}

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/log-in");
  }

  if (!req.user.isAdmin) {
    return res.status(403).render("error", {
      title: "Not allowed",
      message: "Only admins can do that.",
    });
  }

  next();
}

module.exports = { requireLogin, requireAdmin };
