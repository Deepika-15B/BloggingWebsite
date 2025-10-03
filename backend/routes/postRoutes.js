const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

// Get all posts with optional search, tag filter, and sort
router.get("/", async (req, res) => {
  try {
    const { q, tag, category, sort } = req.query;

    const query = { isPublished: true };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }
    if (tag) {
      query.tags = { $regex: `^${tag}$`, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const sortOption = (() => {
      if (sort === 'trending') return { viewCount: -1, likes: -1, createdAt: -1 };
      if (sort === 'popular') return { shareCount: -1, likes: -1 };
      return { createdAt: -1 };
    })();

    const posts = await Post.find(query)
      .populate("author", "username fullName email")
      .populate("likes", "username") // Populate likes with username
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }
      })
      .sort(sortOption);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// Get single post by ID or slug
router.get("/:id", async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const criteria = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
    const post = await Post.findOne(criteria)
      .populate("author", "username fullName email")
      .populate("likes", "username") // Populate likes with username
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }
      });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create new post
router.post("/", async (req, res) => {
  try {
    console.log("Received post creation request:", req.body);
    const { title, content, category, authorUsername, image, tags } = req.body;

    if (!title || !content || !category || !authorUsername) {
      console.log("Missing required fields:", { title: !!title, content: !!content, category: !!category, authorUsername: !!authorUsername });
      return res.status(400).json({ error: "Title, content, category, and author are required" });
    }

    // Validate category
    const validCategories = ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'education'];
    if (!validCategories.includes(category)) {
      console.log("Invalid category:", category);
      console.log("Valid categories:", validCategories);
      return res.status(400).json({ error: "Invalid category. Must be one of: " + validCategories.join(', ') });
    }

    console.log("Category received:", category);
    console.log("Category type:", typeof category);
    console.log("Category length:", category ? category.length : 'undefined');
    console.log("Category is valid:", validCategories.includes(category));
    console.log("Author username received:", authorUsername);

    // Find the author by username
    console.log("Looking for author with username:", authorUsername);
    const author = await User.findOne({ username: authorUsername });
    if (!author) {
      console.log("Author not found for username:", authorUsername);
      return res.status(404).json({ error: "Author not found" });
    }

    console.log("Author found:", author.username);

    const newPost = new Post({
      title,
      content,
      category,
      image: image || null,  // Store image if provided
      author: author._id,
      tags: Array.isArray(tags) ? tags : []
    });

    console.log("Creating post with data:", {
      title,
      content: content.substring(0, 50) + "...",
      category,
      author: author._id,
      authorUsername: author.username
    });

    const savedPost = await newPost.save();
    console.log("Post saved successfully:", savedPost._id);
    console.log("Saved post category:", savedPost.category);
    console.log("Saved post author:", savedPost.author);
    
    const populatedPost = await Post.findById(savedPost._id)
      .populate("author", "username fullName email")
      .populate("likes", "username");
    
    console.log("Populated post:", {
      id: populatedPost._id,
      title: populatedPost.title,
      category: populatedPost.category,
      author: populatedPost.author
    });

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update post
router.put("/:id", async (req, res) => {
  try {
    const { title, content, tags, category, image, isPublished } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, category, image, isPublished, updatedAt: Date.now() },
      { new: true }
    ).populate("author", "username fullName email")
     .populate("likes", "username");

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Like/Unlike post
router.post("/:id/like", async (req, res) => {
  try {
    const { authorUsername } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Find user by username
    const user = await User.findOne({ username: authorUsername });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likeIndex = post.likes.indexOf(user._id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(user._id); // Like
    }

    await post.save();
    
    // Return populated post
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username fullName email")
      .populate("likes", "username") // Populate likes with username
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }
      });
    
    res.json(populatedPost);
  } catch (err) {
    console.error("Error in like route:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Add comment to post
router.post("/:id/comment", async (req, res) => {
  try {
    const { content, authorUsername } = req.body;
    const postId = req.params.id;

    if (!content || !authorUsername) {
      return res.status(400).json({ error: "Content and author are required" });
    }

    // Find the author by username
    const author = await User.findOne({ username: authorUsername });
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      author: author._id,
      post: postId
    });

    const savedComment = await newComment.save();

    // Add comment to post
    post.comments.push(savedComment._id);
    await post.save();

    // Return populated post with comments
    const populatedPost = await Post.findById(postId)
      .populate("author", "username fullName email")
      .populate("likes", "username") // Populate likes with username
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }
      });

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get post recommendations based on category and tags
router.get("/:id/recommendations", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Find similar posts based on category and tags
    const recommendations = await Post.find({
      _id: { $ne: post._id }, // Exclude current post
      category: post.category,
      isPublished: true
    })
    .populate("author", "username fullName")
    .sort({ createdAt: -1 })
    .limit(5);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Increment post view count
router.post("/:id/view", async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const criteria = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
    const post = await Post.findOneAndUpdate(
      criteria,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ viewCount: post.viewCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Increment post share count
router.post("/:id/share", async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const criteria = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
    const post = await Post.findOneAndUpdate(
      criteria,
      { $inc: { shareCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ shareCount: post.shareCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get trending posts
router.get("/discover/trending/list", async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true })
      .sort({ viewCount: -1, shareCount: -1, createdAt: -1 })
      .limit(10)
      .populate("author", "username fullName");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
