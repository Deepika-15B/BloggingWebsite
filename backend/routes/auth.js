// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Signup Route
router.post('/signup', async (req, res) => {
    try {
        const {
            fullName, username, email, password, confirmPassword,
            dob, gender, bio, profilePic, category, country, termsAccepted
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            dob,
            gender,
            bio,
            profilePic,
            category,
            country,
            termsAccepted
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Login Route (must be outside of signup route!)
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        console.log('Login attempt for:', emailOrUsername);

        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            console.log('User not found:', emailOrUsername);
            return res.status(400).json({ message: "User not found" });
        }

        console.log('User found, comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        console.log('Login successful for:', emailOrUsername);
        res.status(200).json({ message: "Login successful", user: { username: user.username, email: user.email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
