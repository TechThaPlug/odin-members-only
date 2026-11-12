const { body } = require("express-validator");

const nameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .bail()
    .isLength({ max: 50 })
    .withMessage(`${label} must be 50 characters or fewer.`);

const signUpRules = [
  nameRule("firstName", "First name"),
  nameRule("lastName", "Last name"),

  body("username")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .bail()
    .isLength({ max: 254 })
    .withMessage("That email address is too long."),

  // bcrypt only uses the first 72 bytes, so we cap the length
  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8 to 72 characters."),

  // The custom validator the brief asks for
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The two passwords do not match."),
];

const passcodeRules = [
  body("passcode").trim().notEmpty().withMessage("Please enter the passcode."),
];

const messageRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Please enter a title.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("The title must be 100 characters or fewer."),

  body("body")
    .trim()
    .notEmpty()
    .withMessage("Please write a message.")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("The message must be 1000 characters or fewer."),
];

module.exports = { signUpRules, passcodeRules, messageRules };
