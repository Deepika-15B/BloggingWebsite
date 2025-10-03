const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFollowWithRealUsers() {
  try {
    console.log('Testing follow user functionality with real users...');
    
    // First, let's get some users from the database
    console.log('Fetching users from database...');
    const usersResponse = await fetch('http://localhost:5000/api/users/search');
    const users = await usersResponse.json();
    console.log('Available users:', users);
    
    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test follow functionality');
      return;
    }
    
    const follower = users[0];
    const targetUser = users[1];
    
    console.log(`Testing follow: ${follower.username} following ${targetUser.username}`);
    
    // Test follow
    const followResponse = await fetch(`http://localhost:5000/api/users/follow/${targetUser._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        followerUsername: follower.username
      })
    });
    
    console.log('Follow response status:', followResponse.status);
    const followResult = await followResponse.json();
    console.log('Follow response:', followResult);
    
    if (followResponse.ok) {
      console.log('✅ Follow request successful');
      
      // Test follow status
      const statusResponse = await fetch(`http://localhost:5000/api/users/follow-status/${targetUser._id}?followerUsername=${follower.username}`);
      const statusResult = await statusResponse.json();
      console.log('Follow status:', statusResult);
      
    } else {
      console.log('❌ Follow request failed:', followResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing follow:', error.message);
  }
}

testFollowWithRealUsers();

