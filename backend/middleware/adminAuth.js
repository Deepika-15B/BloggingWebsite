const jwt = require("jsonwebtoken");

module.exports = function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }
    const payload = jwt.verify(token, secret);
    if (!payload || payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.admin = { email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


