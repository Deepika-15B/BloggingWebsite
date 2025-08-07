// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');           // signup/login for normal users
const adminAuthRoutes = require('./routes/admin');     // admin login (e.g., /api/admin/login)
const adminManageRoutes = require('./routes/adminRoutes'); // admin user/post management

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// DB connection (no deprecated options)
mongoose.connect('mongodb://localhost:27017/blogUsers')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// route mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);          // admin login route(s)
app.use('/api/admin/manage', adminManageRoutes); // user/post management for admin

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
