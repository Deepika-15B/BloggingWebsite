const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: String,
    bio: { type: String, maxlength: 200 },
    profilePic: String,
    category: String,
    country: String,
    termsAccepted: { type: Boolean, required: true }
});

module.exports = mongoose.model('User', userSchema);
