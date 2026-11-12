const { validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

const clean = (value) => String(value ?? "").trim();

function canSeeAuthors(user) {
  return Boolean(user && (user.isMember || user.isAdmin));
}

async function index(req, res) {
  const withAuthors = canSeeAuthors(req.user);
  const messages = await db.getMessages({ withAuthors });

  res.render("index", { title: "The Clubhouse", messages, withAuthors });
}

function showForm(req, res) {
  res.render("message-form", {
    title: "New message",
    errors: [],
    values: { title: "", body: "" },
  });
}

async function create(req, res) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).render("message-form", {
      title: "New message",
      errors: result.array().map((error) => error.msg),
      values: { title: clean(req.body.title), body: clean(req.body.body) },
    });
  }

  const { title, body } = matchedData(req);

  await db.createMessage({ title, body, userId: req.user.id });
  res.redirect("/");
}

async function remove(req, res) {
  const idText = String(req.params.id);

  if (/^[1-9]\d{0,8}$/.test(idText)) {
    await db.deleteMessage(Number(idText));
  }

  res.redirect("/");
}

module.exports = { index, showForm, create, remove };
