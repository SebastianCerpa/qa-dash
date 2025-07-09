const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    // Test password hashing
    const password = 'Ride..0106.';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
    
    // Test password comparison (should be true)
    const isMatch1 = await bcrypt.compare(password, hashedPassword);
    console.log('Password matches hash:', isMatch1);
    
    // Test incorrect password (should be false)
    const isMatch2 = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('Wrong password matches hash:', isMatch2);
  } catch (error) {
    console.error('Error testing bcrypt:', error);
  }
}

testBcrypt();