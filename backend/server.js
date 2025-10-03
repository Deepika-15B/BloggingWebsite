// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });  // ensure backend/.env is used

const authRoutes = require('./routes/auth');           // signup/login for normal users
const adminAuthRoutes = require('./routes/admin');     // admin login
const adminManageRoutes = require('./routes/adminRoutes'); // admin user/post management
const userRoutes = require('./routes/userRoutes');     // user profiles, following, etc.

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// ✅ DB connection (Atlas instead of local Compass)
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/blog-project";
mongoose.connect(mongoURI)
  .then(() => {
    try {
      const safeUri = new URL(mongoURI.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
      console.log(`✅ MongoDB connected → host: ${safeUri.hostname}, db: ${safeUri.pathname.replace('/', '')}`);
    } catch (_) {
      console.log("✅ MongoDB connected");
    }
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
// route mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/manage', adminManageRoutes);
app.use('/api/users', userRoutes);
const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
