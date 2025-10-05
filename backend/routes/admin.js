const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Admin credentials come from env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@blog.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }
    const token = jwt.sign({ role: "admin", email }, secret, { expiresIn: "2h" });
    return res.status(200).json({ message: "Admin login successful", token });
  }
  return res.status(401).json({ message: "Invalid admin credentials" });
});

module.exports = router;
