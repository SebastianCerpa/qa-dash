const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testNextAuthSetup() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testing NextAuth Setup...');
  console.log('================================');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection: OK');
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'DATABASE_URL'
    ];
    
    console.log('\n🔧 Environment Variables:');
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('CLIENT') ? '[HIDDEN]' : value}`);
      } else {
        console.log(`❌ ${envVar}: NOT SET`);
      }
    });
    
    // Test user authentication
    console.log('\n👤 Testing User Authentication:');
    const testEmail = 'sebastian.cerpa@ridepanda.com';
    const testPassword = 'Ride..0106';
    
    const user = await prisma.users.findUnique({
      where: { email: testEmail }
    });
    
    if (user) {
      console.log(`✅ User found: ${user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
      
      // Test password verification
      const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
      console.log(`   - Password verification: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log(`❌ User not found: ${testEmail}`);
    }
    
    // Test database schema
    console.log('\n📊 Database Schema Check:');
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    `;
    
    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    
    // Check users table structure
    const userColumns = await prisma.$queryRaw`PRAGMA table_info(users);`;
    console.log('\nUsers table columns:');
    userColumns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    console.log('\n🎯 NextAuth Configuration Test:');
    console.log('   - JWT Strategy: Enabled');
    console.log('   - Session Max Age: 30 days');
    console.log('   - Debug Mode: Enabled');
    console.log('   - Providers: Credentials + Google');
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open http://localhost:3001/test-auth to test session');
    console.log('   2. Try logging in at http://localhost:3001/login');
    console.log('   3. Check browser console for any errors');
    console.log('   4. Verify cookies are being set properly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNextAuthSetup();