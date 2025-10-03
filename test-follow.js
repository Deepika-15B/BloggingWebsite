const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFollowUser() {
  try {
    console.log('Testing follow user functionality...');
    
    // Test data
    const followerUsername = 'testuser1';
    const targetUserId = '507f1f77bcf86cd799439011'; // Example ObjectId
    
    const response = await fetch('http://localhost:5000/api/users/follow/' + targetUserId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        followerUsername: followerUsername
      })
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Follow request successful');
    } else {
      console.log('❌ Follow request failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing follow:', error.message);
  }
}

testFollowUser();
