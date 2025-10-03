// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

// ✅ Forgot Password (request reset)
router.post('/forgot-password', async (req, res) => {
    try {
        const { emailOrUsername } = req.body;
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });
        if (!user) {
            // Do not reveal user existence
            return res.status(200).json({ message: 'If the account exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        // In production: email this link to the user
        const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${token}`;
        console.log('[Password reset link]', resetLink);
        return res.json({ message: 'Password reset link generated', resetLink });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ✅ Reset Password (use token)
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;
        if (!newPassword || newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or expired' });
        }

        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
