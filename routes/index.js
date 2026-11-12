const { Router } = require("express");
const auth = require("../controllers/authController");
const club = require("../controllers/clubController");
const messages = require("../controllers/messageController");
const { requireLogin, requireAdmin } = require("../middleware/auth");
const { signUpRules, passcodeRules, messageRules } = require("../validators");

const router = Router();

router.get("/", messages.index);

router.get("/sign-up", auth.showSignUp);
router.post("/sign-up", signUpRules, auth.signUp);

router.get("/log-in", auth.showLogIn);
router.post("/log-in", auth.logIn);
router.post("/log-out", auth.logOut);

router.get("/join", requireLogin, club.showJoin);
router.post("/join", requireLogin, passcodeRules, club.join);

router.get("/admin", requireLogin, club.showAdmin);
router.post("/admin", requireLogin, passcodeRules, club.admin);

router.get("/messages/new", requireLogin, messages.showForm);
router.post("/messages", requireLogin, messageRules, messages.create);
router.post("/messages/:id/delete", requireAdmin, messages.remove);

module.exports = router;
