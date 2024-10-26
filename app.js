const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const {
  postSignUp,
  signUpValidation,
  localStrategy,
  deserialize,
  postJoinClub,
} = require("./controllers/control");
const app = express();
const assetsPath = path.join(__dirname, "public");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "Vybz", resave: false, saveUninitialized: false }));
app.use(passport.session());

passport.use(localStrategy);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(deserialize);

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("sign-up"));
app.get("/join-club", (req, res) => res.render("join-club"));

app.post("/join-club", postJoinClub);
app.post("/sign-up", signUpValidation, postSignUp);

const PORT = 3000;
app.listen(PORT, () => console.log(`Port ${PORT} ongoing!`));
