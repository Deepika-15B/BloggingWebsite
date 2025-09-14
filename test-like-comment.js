const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

async function testLikeAndComment() {
  try {
    console.log('🧪 Testing Like and Comment Functionality...\n');

    // First, let's get all posts to see what we're working with
    console.log('1. Fetching all posts...');
    const postsResponse = await fetch(`${BASE_URL}/posts`);
    const posts = await postsResponse.json();
    
    if (posts.length === 0) {
      console.log('❌ No posts found. Please create a post first.');
      return;
    }

    const testPost = posts[0];
    console.log(`✅ Found post: "${testPost.title}" (ID: ${testPost._id})`);
    console.log(`   Current likes: ${testPost.likes ? testPost.likes.length : 0}`);
    console.log(`   Current comments: ${testPost.comments ? testPost.comments.length : 0}\n`);

    // Test liking a post
    console.log('2. Testing like functionality...');
    const likeResponse = await fetch(`${BASE_URL}/posts/${testPost._id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authorUsername: 'testuser' // This should be a real username from your database
      })
    });

    if (likeResponse.ok) {
      const updatedPost = await likeResponse.json();
      console.log(`✅ Post liked successfully!`);
      console.log(`   New like count: ${updatedPost.likes ? updatedPost.likes.length : 0}`);
      console.log(`   Likes array:`, updatedPost.likes);
    } else {
      const error = await likeResponse.json();
      console.log(`❌ Error liking post:`, error);
    }

    // Test adding a comment
    console.log('\n3. Testing comment functionality...');
    const commentResponse = await fetch(`${BASE_URL}/posts/${testPost._id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'This is a test comment from the test script!',
        authorUsername: 'testuser' // This should be a real username from your database
      })
    });

    if (commentResponse.ok) {
      const updatedPost = await commentResponse.json();
      console.log(`✅ Comment added successfully!`);
      console.log(`   New comment count: ${updatedPost.comments ? updatedPost.comments.length : 0}`);
      console.log(`   Comments array:`, updatedPost.comments);
    } else {
      const error = await commentResponse.json();
      console.log(`❌ Error adding comment:`, error);
    }

    // Test getting the updated post
    console.log('\n4. Fetching updated post...');
    const finalResponse = await fetch(`${BASE_URL}/posts/${testPost._id}`);
    const finalPost = await finalResponse.json();
    
    console.log(`✅ Final post state:`);
    console.log(`   Title: ${finalPost.title}`);
    console.log(`   Likes: ${finalPost.likes ? finalPost.likes.length : 0}`);
    console.log(`   Comments: ${finalPost.comments ? finalPost.comments.length : 0}`);
    
    if (finalPost.likes && finalPost.likes.length > 0) {
      console.log(`   Like details:`, finalPost.likes);
    }
    
    if (finalPost.comments && finalPost.comments.length > 0) {
      console.log(`   Comment details:`, finalPost.comments);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testLikeAndComment();
