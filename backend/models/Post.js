const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'education']
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,  // Store image as Base64 string or URL
    default: null
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }  // users who liked
  ],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment" } // link to comment model
  ],
  // New fields for recommendations and analytics
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  bookmarksCount: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 }, // estimated minutes
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add pre-save middleware to log the data being saved
postSchema.pre('save', function(next) {
  console.log('Saving post with data:', {
    title: this.title,
    category: this.category,
    author: this.author,
    contentLength: this.content ? this.content.length : 0
  });
  // generate slug if missing
  if (!this.slug && this.title) {
    const base = this.title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const rand = Math.random().toString(36).substring(2, 7);
    this.slug = `${base}-${rand}`;
  }
  // estimate reading time (200 wpm)
  if (this.content) {
    const words = this.content.split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.round(words / 200));
  }
  this.updatedAt = new Date();
  next();
});

// Add post-save middleware to log what was actually saved
postSchema.post('save', function(doc) {
  console.log('Post saved successfully:', {
    id: doc._id,
    title: doc.title,
    category: doc.category,
    author: doc.author
  });
});

module.exports = mongoose.model("Post", postSchema);
