// Diagnostic script to identify differences between local and Vercel production environments
const fs = require('fs');
const path = require('path');

async function diagnoseVercelIssues() {
  console.log('🔍 Diagnosing Vercel Production Issues');
  console.log('=====================================\n');

  const issues = [];
  const recommendations = [];

  // 1. Check NextAuth configuration for production
  console.log('1. Checking NextAuth configuration...');
  
  const authPath = path.join(__dirname, 'lib', 'auth.ts');
  const routePath = path.join(__dirname, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
  
  try {
    const authContent = fs.readFileSync(authPath, 'utf8');
    const routeContent = fs.readFileSync(routePath, 'utf8');
    
    // Check for debug mode configuration
    if (authContent.includes('debug: process.env.NODE_ENV !== \'production\'')) {
      console.log('✓ Debug mode properly configured for production');
    } else {
      issues.push('Debug mode configuration may cause issues in production');
    }
    
    // Check for session configuration in route
    if (routeContent.includes('if (process.env.NODE_ENV !== \'production\')')) {
      console.log('✓ Environment-specific configuration found in route');
    }
    
    // Check for NEXTAUTH_URL requirement
    if (!authContent.includes('NEXTAUTH_URL')) {
      issues.push('NEXTAUTH_URL environment variable not explicitly checked');
      recommendations.push('Add NEXTAUTH_URL to environment variable validation');
    }
    
  } catch (error) {
    issues.push(`Error reading NextAuth files: ${error.message}`);
  }

  // 2. Check Vercel configuration
  console.log('\n2. Checking Vercel configuration...');
  
  const vercelPath = path.join(__dirname, 'vercel.json');
  try {
    const vercelContent = fs.readFileSync(vercelPath, 'utf8');
    const vercelConfig = JSON.parse(vercelContent);
    
    console.log('✓ vercel.json found');
    
    // Check build command
    if (vercelConfig.buildCommand && vercelConfig.buildCommand.includes('prisma')) {
      console.log('✓ Prisma commands included in build');
    } else {
      issues.push('Prisma commands may not be properly configured in build');
    }
    
    // Check function timeout
    if (vercelConfig.functions && vercelConfig.functions['app/api/**/*.ts']) {
      console.log(`✓ API function timeout: ${vercelConfig.functions['app/api/**/*.ts'].maxDuration}s`);
    } else {
      recommendations.push('Consider adding function timeout configuration for API routes');
    }
    
  } catch (error) {
    issues.push(`Error reading vercel.json: ${error.message}`);
  }

  // 3. Check database configuration
  console.log('\n3. Checking database configuration...');
  
  const prismaPath = path.join(__dirname, 'lib', 'prisma.ts');
  try {
    const prismaContent = fs.readFileSync(prismaPath, 'utf8');
    
    if (prismaContent.includes('STORAGE_DATABASE_URL')) {
      console.log('✓ Fallback database URL configured');
    } else {
      recommendations.push('Consider adding fallback database URL for Vercel');
    }
    
    if (prismaContent.includes('process.env.NODE_ENV !== \'production\'')) {
      console.log('✓ Production-specific Prisma configuration found');
    }
    
  } catch (error) {
    issues.push(`Error reading Prisma configuration: ${error.message}`);
  }

  // 4. Check for potential environment variable issues
  console.log('\n4. Checking environment variable requirements...');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  console.log('Required environment variables for production:');
  requiredEnvVars.forEach(envVar => {
    console.log(`  - ${envVar}`);
  });

  // 5. Check middleware configuration
  console.log('\n5. Checking middleware configuration...');
  
  const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
  try {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    if (middlewareContent.includes('withAuth')) {
      console.log('✓ NextAuth middleware configured');
    }
    
    if (middlewareContent.includes('publicRoutes')) {
      console.log('✓ Public routes defined');
    }
    
  } catch (error) {
    issues.push(`Error reading middleware: ${error.message}`);
  }

  // 6. Specific Vercel production issues
  console.log('\n6. Common Vercel production issues...');
  
  const commonIssues = [
    {
      issue: 'NEXTAUTH_URL not set correctly',
      description: 'Should be set to https://qa-pandash.vercel.app',
      solution: 'Set NEXTAUTH_URL=https://qa-pandash.vercel.app in Vercel environment variables'
    },
    {
      issue: 'Database connection timeout',
      description: 'Vercel functions have limited execution time',
      solution: 'Ensure database queries are optimized and connection pooling is configured'
    },
    {
      issue: 'Session configuration mismatch',
      description: 'Different session behavior between local and production',
      solution: 'Ensure consistent session configuration across environments'
    },
    {
      issue: 'Google OAuth redirect URI mismatch',
      description: 'Google OAuth may not be configured for production domain',
      solution: 'Add https://qa-pandash.vercel.app/api/auth/callback/google to Google OAuth settings'
    }
  ];
  
  commonIssues.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.issue}`);
    console.log(`   Description: ${item.description}`);
    console.log(`   Solution: ${item.solution}`);
  });

  // Summary
  console.log('\n\n📋 SUMMARY');
  console.log('===========');
  
  if (issues.length > 0) {
    console.log('\n❌ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n🔧 IMMEDIATE ACTIONS FOR VERCEL:');
  console.log('1. Verify NEXTAUTH_URL is set to: https://qa-pandash.vercel.app');
  console.log('2. Check all environment variables are properly set in Vercel dashboard');
  console.log('3. Verify Google OAuth redirect URIs include production domain');
  console.log('4. Check database connection and ensure it\'s accessible from Vercel');
  console.log('5. Review Vercel function logs for specific error details');
  
  console.log('\n📱 To check Vercel environment variables:');
  console.log('1. Go to Vercel dashboard');
  console.log('2. Select your project (qa-pandash)');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Ensure all required variables are set for Production environment');
}

// Run the diagnostic
diagnoseVercelIssues().catch(console.error);