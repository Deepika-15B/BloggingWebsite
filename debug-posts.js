const mongoose = require('mongoose');
const Post = require('./backend/models/Post');
const User = require('./backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugPosts() {
  try {
    console.log('🔍 Checking posts in database...\n');
    
    // Get all posts
    const posts = await Post.find({}).populate('author', 'username fullName');
    
    if (posts.length === 0) {
      console.log('❌ No posts found in database');
      return;
    }
    
    console.log(`📊 Found ${posts.length} posts:\n`);
    
    posts.forEach((post, index) => {
      console.log(`--- Post ${index + 1} ---`);
      console.log(`ID: ${post._id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Category: "${post.category}" (type: ${typeof post.category})`);
      console.log(`Author: ${post.author ? post.author.username : 'No author'}`);
      console.log(`Created: ${post.createdAt}`);
      console.log(`Raw post object:`, JSON.stringify(post, null, 2));
      console.log('');
    });
    
    // Check for posts without categories
    const postsWithoutCategory = posts.filter(post => !post.category || post.category.trim() === '');
    if (postsWithoutCategory.length > 0) {
      console.log(`⚠️  Found ${postsWithoutCategory.length} posts without categories:`);
      postsWithoutCategory.forEach(post => {
        console.log(`- ${post.title} (ID: ${post._id})`);
      });
    }
    
    // Check for posts with invalid categories
    const validCategories = ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'education'];
    const postsWithInvalidCategory = posts.filter(post => 
      post.category && !validCategories.includes(post.category)
    );
    
    if (postsWithInvalidCategory.length > 0) {
      console.log(`⚠️  Found ${postsWithInvalidCategory.length} posts with invalid categories:`);
      postsWithInvalidCategory.forEach(post => {
        console.log(`- ${post.title}: "${post.category}" (ID: ${post._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPosts();
