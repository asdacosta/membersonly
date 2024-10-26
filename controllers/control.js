const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const crypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

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
    return res.render("sign-up", {
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

      const user = await db.findUser(req.body.email);
      const membership = await db.checkMembership(req.body.email);
      res.render("members", {
        user: user,
        membership: membership,
        message: "Welcome to the Club",
      });
    });
  } catch (error) {
    return next(error);
  }
}

async function postJoinClub(req, res) {
  const user = await db.findUser(req.body.email);
  if (!user) return res.render("join-club", { error: "Be a member first." });

  if (req.body.passcode !== "Vybz") {
    return res.render("join-club", { error: "Wrong code :(" });
  }

  const response = await db.updateMembership(req.body.email);
  if (response) {
    res.render("members", {
      message: "Welcome to the club :)",
      membership: response,
    });
  }
}

const localStrategy = new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await db.findAllUserData(email);
      if (!user) return done(null, false, { message: "Incorrect username" });

      const match = await crypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

const deserialize = async (id, done) => {
  try {
    const user = await db.findUserWithId(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
};

async function postLogIn() {
  passport.authenticate("local", {
    successRedirect: "/members",
    failureRedirect: "/log-in",
  });
}

function getLogOut(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
}

function getMembers(req, res) {
  if (!req.isAuthenticated()) return res.redirect("/log-in");
  res.render("members", {
    user: req.user,
    membership: req.user.membership_status,
    message: "",
  });
}

async function postMessage(req, res) {
  await db.addMessage(req.body.email, req.body.title, req.body.message);
  res.redirect("/");
}

async function getHome(req, res) {
  const allMessages = await db.retrieveMessages();
  if (req.user) {
    const membership = await db.checkMembership(req.user.username);
    return res.render("index", {
      user: req.user,
      allMessages: allMessages,
      membership: membership,
    });
  }
  res.render("index", {
    user: req.user,
    allMessages: allMessages,
    membership: false,
  });
}

module.exports = {
  postSignUp,
  signUpValidation,
  localStrategy,
  deserialize,
  postJoinClub,
  postLogIn,
  getLogOut,
  getMembers,
  postMessage,
  getHome,
};
