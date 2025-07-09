#!/usr/bin/env node

/**
 * Deployment script for running database migrations in production
 * This should be run after deployment to ensure the database schema is up to date
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env }
    });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function deployMigrations() {
  console.log('🚀 Starting database migration deployment...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('Database URL present:', !!databaseUrl);
  
  try {
    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client');
    
    // Deploy migrations
    runCommand('npx prisma migrate deploy', 'Deploying database migrations');
    
    console.log('\n🎉 Database migrations deployed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify your application is working correctly');
    console.log('2. Test the test plan creation functionality');
    console.log('3. Monitor for any database-related errors');
    
  } catch (error) {
    console.error('\n💥 Migration deployment failed:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Verify DATABASE_URL is correct and accessible');
    console.error('2. Check database permissions');
    console.error('3. Ensure the database server is running');
    console.error('4. Review migration files for syntax errors');
    process.exit(1);
  }
}

// Run the migration deployment
deployMigrations().catch((error) => {
  console.error('Unhandled error in migration deployment:', error);
  process.exit(1);
});