// Using built-in fetch (available in Node.js 18+)

async function testComment() {
  try {
    console.log('Testing comment functionality...');
    
    const commentData = {
      content: "This is a test comment",
      authorUsername: "testuser"
    };

    const response = await fetch('http://localhost:5000/api/posts/68aade387a27ceb77c2c6735/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Comment added successfully!');
      console.log('Post updated with comment');
    } else {
      console.log('❌ Error adding comment:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testComment();
