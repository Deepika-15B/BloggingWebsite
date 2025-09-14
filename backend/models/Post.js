const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
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
