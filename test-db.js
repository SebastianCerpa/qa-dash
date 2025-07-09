const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Check if the user exists
    const email = 'sebastian.cerpa@ridepanda.com';
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (user) {
      console.log('User found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // Don't log the full password hash for security
        password_hash_length: user.password_hash.length,
        password_hash_prefix: user.password_hash.substring(0, 10) + '...'
      });
      
      // Test password verification
      const password = 'Ride..0106.';
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isPasswordValid);
    } else {
      console.log('User not found with email:', email);
    }
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();