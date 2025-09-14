const mongoose = require('mongoose');
const Post = require('./backend/models/Post');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixPosts() {
  try {
    console.log('🔧 Fixing posts with missing or invalid categories...\n');
    
    // Find posts without categories or with invalid categories
    const validCategories = ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'education'];
    
    const postsToFix = await Post.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' },
        { category: { $nin: validCategories } }
      ]
    });
    
    if (postsToFix.length === 0) {
      console.log('✅ All posts already have valid categories');
      return;
    }
    
    console.log(`📝 Found ${postsToFix.length} posts to fix:\n`);
    
    // Fix each post
    for (const post of postsToFix) {
      console.log(`Fixing post: "${post.title}"`);
      console.log(`Old category: "${post.category}"`);
      
      // Set a default category based on the post title or content
      let newCategory = 'lifestyle'; // default fallback
      
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      
      if (title.includes('tech') || title.includes('programming') || title.includes('computer') || content.includes('tech')) {
        newCategory = 'technology';
      } else if (title.includes('food') || title.includes('cooking') || title.includes('recipe') || content.includes('food')) {
        newCategory = 'food';
      } else if (title.includes('travel') || title.includes('trip') || title.includes('vacation') || content.includes('travel')) {
        newCategory = 'travel';
      } else if (title.includes('health') || title.includes('fitness') || title.includes('exercise') || content.includes('health')) {
        newCategory = 'health';
      } else if (title.includes('business') || title.includes('career') || title.includes('work') || content.includes('business')) {
        newCategory = 'business';
      } else if (title.includes('movie') || title.includes('music') || title.includes('entertainment') || content.includes('movie')) {
        newCategory = 'entertainment';
      } else if (title.includes('learn') || title.includes('study') || title.includes('education') || content.includes('learn')) {
        newCategory = 'education';
      }
      
      console.log(`New category: "${newCategory}"`);
      
      // Update the post
      await Post.findByIdAndUpdate(post._id, { category: newCategory });
      console.log(`✅ Fixed!\n`);
    }
    
    console.log('🎉 All posts have been fixed!');
    
    // Verify the fix
    const remainingPostsToFix = await Post.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' },
        { category: { $nin: validCategories } }
      ]
    });
    
    if (remainingPostsToFix.length === 0) {
      console.log('✅ Verification successful: All posts now have valid categories');
    } else {
      console.log(`⚠️  Still have ${remainingPostsToFix.length} posts to fix`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixPosts();
