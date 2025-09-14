const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog-project')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Check if test user exists
      let testUser = await User.findOne({ username: 'testuser' });
      
      if (!testUser) {
        console.log('👤 Creating test user...');
        
        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = new User({
          fullName: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: hashedPassword,
          dob: new Date('1990-01-01'),
          gender: 'Other',
          bio: 'Test user for debugging',
          profilePic: '',
          category: 'Tech',
          country: 'Test Country',
          termsAccepted: true
        });
        
        await testUser.save();
        console.log('✅ Test user created successfully');
      } else {
        console.log('👤 Test user already exists');
      }
      
      // Test login
      console.log('\n🔐 Testing login...');
      const testPassword = 'password123';
      const isMatch = await bcrypt.compare(testPassword, testUser.password);
      
      console.log(`Username: ${testUser.username}`);
      console.log(`Password to test: ${testPassword}`);
      console.log(`Password match: ${isMatch}`);
      
      if (isMatch) {
        console.log('✅ Login test successful!');
        console.log('\n📝 You can now login with:');
        console.log('Username: testuser');
        console.log('Password: password123');
      } else {
        console.log('❌ Login test failed!');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
