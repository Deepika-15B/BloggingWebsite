const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// Bookmark / Reading List toggle
router.post("/bookmark/:postId", async (req, res) => {
  try {
    const { username } = req.body;
    const { postId } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const already = user.bookmarks.includes(postId);
    if (already) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { bookmarks: postId } }
      );
      await Post.updateOne({ _id: postId }, { $inc: { bookmarksCount: -1 } });
      return res.json({ bookmarked: false });
    } else {
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { bookmarks: postId } }
      );
      await Post.updateOne({ _id: postId }, { $inc: { bookmarksCount: 1 } });
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get reading list
router.get("/bookmarks/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate({ path: 'bookmarks', populate: { path: 'author', select: 'username fullName' } })
      .select('bookmarks');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.bookmarks || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile by username
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password") // Exclude password
      .populate("followers", "username fullName profilePic")
      .populate("following", "username fullName profilePic");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id, isPublished: true })
      .populate("author", "username fullName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      posts
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Follow/Unfollow user
router.post("/follow/:userId", async (req, res) => {
  try {
    const { followerUsername } = req.body;
    const targetUserId = req.params.userId;

    if (!followerUsername) {
      return res.status(400).json({ error: "Follower username is required" });
    }

    // Find the follower
    const follower = await User.findOne({ username: followerUsername });
    if (!follower) {
      return res.status(404).json({ error: "Follower not found" });
    }

    // Find the target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    // Check if already following
    const isFollowing = follower.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(follower._id, {
        $pull: { following: targetUserId },
        $inc: { followingCount: -1 }
      });
      
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: follower._id },
        $inc: { followerCount: -1 }
      });
      
      res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(follower._id, {
        $addToSet: { following: targetUserId },
        $inc: { followingCount: 1 }
      });
      
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: follower._id },
        $inc: { followerCount: 1 }
      });
      
      res.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get following status
router.get("/follow-status/:userId", async (req, res) => {
  try {
    const { followerUsername } = req.query;
    const targetUserId = req.params.userId;

    if (!followerUsername) {
      return res.status(400).json({ error: "Follower username is required" });
    }

    const follower = await User.findOne({ username: followerUsername });
    if (!follower) {
      return res.status(404).json({ error: "Follower not found" });
    }

    const isFollowing = follower.following.includes(targetUserId);
    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's feed (posts from followed users)
router.get("/feed/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get posts from users that the current user follows
    const feedPosts = await Post.find({
      author: { $in: user.following },
      isPublished: true
    })
    .populate("author", "username fullName profilePic")
    .populate("likes", "username")
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile
router.put("/profile/:username", async (req, res) => {
  try {
    const { bio, socialLinks } = req.body;
    
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { 
        bio,
        socialLinks,
        updatedAt: new Date()
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users (for search/follow suggestions)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const query = q ? { 
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(query)
      .select("username fullName profilePic bio followerCount")
      .limit(10);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
