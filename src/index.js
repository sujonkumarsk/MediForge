const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const User = require("./models/User");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve CSS and static files
app.set("view engine", "ejs");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/UserDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/dashboard", (req, res) => res.render("dashboard"));

// Signup route
app.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: full_name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect("/");
  } catch (err) {
    res.render("signup", { error: "Error: User already exists or invalid data." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { error: "Invalid password." });
    }

    res.redirect("/dashboard");
  } catch (err) {
    res.render("login", { error: "Login failed. Please try again." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
