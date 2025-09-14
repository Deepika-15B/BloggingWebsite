const fetch = require('node-fetch');

async function testPostCreation() {
  try {
    console.log('Testing post creation...');
    
    const postData = {
      title: "Test Blog Post",
      content: "<p>This is a test blog post content.</p>",
      authorUsername: "testuser"
    };

    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Post created successfully!');
      console.log('Post ID:', result._id);
      console.log('Title:', result.title);
      console.log('Author:', result.author.username);
    } else {
      console.log('❌ Error creating post:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPostCreation();
