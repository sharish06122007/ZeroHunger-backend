const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Clear test user if exists
    await User.deleteOne({ email: 'test.register@example.com' });
    
    // Test 1: Register
    const user = new User({
      fullName: 'Test User',
      email: 'test.register@example.com',
      phone: '+919999999999',
      password: 'Password123!',
      role: 'donor'
    });
    
    await user.save();
    console.log('Registration pre-save hook passed. User saved.');
    
    // Test 2: Login
    const savedUser = await User.findOne({ email: 'test.register@example.com' }).select('+password');
    const isMatch = await savedUser.comparePassword('Password123!');
    console.log('Password Match:', isMatch);
    
    if (isMatch) {
      console.log('SUCCESS: Auth flow is completely working!');
    } else {
      console.log('FAIL: Password did not match!');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
