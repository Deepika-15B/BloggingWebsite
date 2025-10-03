const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugFollowIssue() {
  try {
    console.log('=== DEBUGGING FOLLOW ISSUE ===');
    
    // 1. Test posts endpoint
    console.log('\n1. Testing posts endpoint...');
    const postsResponse = await fetch('http://localhost:5000/api/posts');
    console.log('Posts response status:', postsResponse.status);
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log('Number of posts:', posts.length);
      
      if (posts.length > 0) {
        const post = posts[0];
        console.log('First post:', JSON.stringify(post, null, 2));
        
        if (post.author) {
          console.log('Author ID:', post.author._id);
          console.log('Author username:', post.author.username);
          
          // 2. Test follow with this author
          console.log('\n2. Testing follow with real author...');
          const followResponse = await fetch(`http://localhost:5000/api/users/follow/${post.author._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerUsername: 'testuser' })
          });
          
          console.log('Follow response status:', followResponse.status);
          const followResult = await followResponse.text();
          console.log('Follow response body:', followResult);
          
          if (followResponse.ok) {
            console.log('✅ Follow successful!');
          } else {
            console.log('❌ Follow failed');
          }
        } else {
          console.log('❌ Post author is null or undefined');
        }
      } else {
        console.log('❌ No posts found');
      }
    } else {
      console.log('❌ Failed to fetch posts');
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

debugFollowIssue();
