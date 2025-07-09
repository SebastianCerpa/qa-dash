// Test script to verify authentication process
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('Testing authentication process...');
    
    // Test credentials
    const email = 'sebastian.cerpa@ridepanda.com';
    const password = 'Ride..0106.';
    
    // Find user in database
    console.log(`Looking for user with email: ${email}`);
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error('User not found!');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password_hash_length: user.password_hash?.length || 0
    });
    
    // Test password comparison
    console.log('Testing password comparison...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    console.log(`Password valid: ${isValidPassword}`);
    
    // Log the first few characters of the hash for debugging
    if (user.password_hash) {
      console.log(`Password hash starts with: ${user.password_hash.substring(0, 10)}...`);
    }
    
    // Test with incorrect password
    const wrongPassword = 'WrongPassword123';
    const isInvalidPassword = await bcrypt.compare(wrongPassword, user.password_hash);
    console.log(`Wrong password test (should be false): ${isInvalidPassword}`);
    
  } catch (error) {
    console.error('Error during authentication test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();