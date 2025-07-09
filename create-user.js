const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUser() {
  const prisma = new PrismaClient();
  
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Check if user already exists
    const email = 'sebastian.cerpa@ridepanda.com';
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }
    
    // Create new user
    const password = 'Ride..0106.';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.users.create({
      data: {
        name: 'Sebastian Cerpa',
        email: email,
        role: 'admin',  // Assuming admin role
        password_hash: hashedPassword,
        status: 'active'
      }
    });
    
    console.log('User created successfully:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();