const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin');
const adminManageRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// DB connection (no console noise on serverless warm starts beyond success)
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/blog-project";
if (mongoose.connection.readyState === 0) {
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
}

// routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/manage', adminManageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

module.exports = app;


