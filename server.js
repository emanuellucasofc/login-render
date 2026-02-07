const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

// Usuário fake (somente para estudo)
const userDB = {
  email: "admin@site.com",
  passwordHash: bcrypt.hashSync("123456", 10),
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

function auth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect("/login");
}

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const okEmail = email === userDB.email;
  const okPass = bcrypt.compareSync(password, userDB.passwordHash);

  if (!okEmail || !okPass) {
    return res.render("login", { error: "Email ou senha inválidos" });
  }

  req.session.user = { email };
  res.redirect("/dashboard");
});

app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

app.listen(PORT, () => console.log("Servidor rodando"));
