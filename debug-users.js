const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog-project')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Get all users
      const users = await User.find({});
      console.log(`\n📊 Found ${users.length} users in database:`);
      
      users.forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password (hashed): ${user.password}`);
        console.log(`Password length: ${user.password.length}`);
        console.log(`Created: ${user.createdAt}`);
      });
      
      // Test password hashing
      console.log('\n🔍 Testing password hashing...');
      const testPassword = 'test123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      console.log(`Test password: ${testPassword}`);
      console.log(`Hashed password: ${hashedPassword}`);
      
      // Test comparison
      const isMatch = await bcrypt.compare(testPassword, hashedPassword);
      console.log(`Password match test: ${isMatch}`);
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
