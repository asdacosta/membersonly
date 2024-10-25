const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const crypt = require("bcryptjs");

const signUpValidation = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isAlpha()
    .withMessage("Name must contain only letters."),
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isAlpha()
    .withMessage("Name must contain only letters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Kindly enter a valid email.")
    .custom(async (value) => {
      const user = await db.findUser(value);
      if (user) throw new Error("Email already in use.");
      return true;
    })
    .normalizeEmail(),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 chars.")
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain special char.")
    .escape(),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords don't match.");
    }
    return true;
  }),
];

async function postSignUp(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("index", {
      errors: errors.array(),
      FormData: req.body,
    });
  }

  try {
    crypt.hash(req.body.password, 10, async (err, hashedPwd) => {
      if (err) return next(err);
      db.addUser(
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        hashedPwd
      );
      res.redirect("/");
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  postSignUp,
  signUpValidation,
};
