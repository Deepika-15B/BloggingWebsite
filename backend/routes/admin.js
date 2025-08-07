const express = require("express");
const router = express.Router();

const adminCredentials = {
  email: "admin@blog.com",
  password: "admin123"
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    res.status(200).json({ message: "Admin login successful" });
  } else {
    res.status(401).json({ message: "Invalid admin credentials" });
  }
});

module.exports = router;
