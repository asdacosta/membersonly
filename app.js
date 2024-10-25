const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { postSignUp, signUpValidation } = require("./controllers/control");
const app = express();
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "Vybz", resave: false, saveUninitialized: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("sign-up"));
app.post("/sign-up", signUpValidation, postSignUp);

const PORT = 3000;
app.listen(PORT, () => console.log(`Port ${PORT} ongoing!`));
