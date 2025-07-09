const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function fixUserPassword() {
  const prisma = new PrismaClient();
  
  console.log('🔧 Fixing user password...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection: OK');
    
    const email = 'sebastian.cerpa@ridepanda.com';
    const password = 'Ride..0106';
    
    // Find the user
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`📧 User found: ${user.email}`);
    
    // Test current password
    const currentPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`🔐 Current password valid: ${currentPasswordValid ? '✅ YES' : '❌ NO'}`);
    
    if (!currentPasswordValid) {
      console.log('🔄 Updating password hash...');
      
      // Generate new hash
      const newHashedPassword = await bcrypt.hash(password, 12);
      
      // Update user
      const updatedUser = await prisma.users.update({
        where: { email },
        data: {
          password_hash: newHashedPassword
        }
      });
      
      console.log('✅ Password updated successfully');
      
      // Verify new password
      const newPasswordValid = await bcrypt.compare(password, newHashedPassword);
      console.log(`🔐 New password valid: ${newPasswordValid ? '✅ YES' : '❌ NO'}`);
      
    } else {
      console.log('✅ Password is already correct');
    }
    
    console.log('\n🎯 User details:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Status: ${user.status}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserPassword();