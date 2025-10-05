const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const adminAuth = require("../middleware/adminAuth");

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // omit passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// Delete a user
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find posts authored by this user
    const posts = await Post.find({ author: userId }).select('_id');
    const postIds = posts.map(p => p._id);

    // Delete comments on those posts and the posts themselves
    await Comment.deleteMany({ post: { $in: postIds } });
    const postsDeleteResult = await Post.deleteMany({ _id: { $in: postIds } });

    // Remove references in other users (followers/following/bookmarks)
    await User.updateMany({}, { $pull: { followers: userId, following: userId, bookmarks: { $in: postIds } } });

    // Delete comments authored by this user anywhere
    await Comment.deleteMany({ author: userId });

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and related posts deleted", deletedPosts: postsDeleteResult.deletedCount || 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// Get all posts
router.get("/posts", adminAuth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
});

// Delete a post
router.delete("/posts/:id", adminAuth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
});

// Toggle publish status
router.patch("/posts/:id/publish", adminAuth, async (req, res) => {
  try {
    const { isPublished } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isPublished: !!isPublished, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'username email');
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to update post status", error: err.message });
  }
});

// Summary counts
router.get("/summary", adminAuth, async (req, res) => {
  try {
    const [usersCount, postsCount, flagged] = await Promise.all([
      User.countDocuments({}),
      Post.countDocuments({}),
      Promise.resolve(0)
    ]);
    res.json({ usersCount, postsCount, flagged });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
});

module.exports = router;
