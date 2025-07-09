#!/usr/bin/env node

/**
 * Post-build script for production deployment
 * Handles database migrations and Prisma client generation
 */

const { execSync } = require('child_process');
const path = require('path');

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

async function postBuild() {
  console.log('🚀 Starting post-build process...');
  
  // Check if we're in production environment
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL present:', !!databaseUrl);
  
  if (!databaseUrl) {
    console.log('⚠️  No DATABASE_URL found, skipping database operations');
    return;
  }
  
  try {
    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client');
    
    // Deploy migrations in production
    if (isProduction) {
      runCommand('npx prisma migrate deploy', 'Deploying database migrations');
    } else {
      console.log('⚠️  Not in production, skipping migration deployment');
    }
    
    console.log('\n🎉 Post-build process completed successfully!');
  } catch (error) {
    console.error('\n💥 Post-build process failed:', error.message);
    process.exit(1);
  }
}

// Run the post-build process
postBuild().catch((error) => {
  console.error('Unhandled error in post-build:', error);
  process.exit(1);
});