// Static analysis of NextAuth configuration without requiring a running server
const fs = require('fs');
const path = require('path');

async function testNextAuthStatic() {
  console.log('===== Static Analysis of NextAuth Configuration =====\n');
  
  // 1. Check if auth.ts exists
  console.log('1. Checking for auth.ts file...');
  const authPath = path.join(__dirname, 'lib', 'auth.ts');
  let authContent;
  
  try {
    authContent = fs.readFileSync(authPath, 'utf8');
    console.log('✓ auth.ts file found');
  } catch (error) {
    console.error('✗ auth.ts file not found');
    return;
  }
  
  // 2. Check for route.ts file
  console.log('\n2. Checking for route.ts file...');
  const routePath = path.join(__dirname, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
  let routeContent;
  
  try {
    routeContent = fs.readFileSync(routePath, 'utf8');
    console.log('✓ route.ts file found');
  } catch (error) {
    console.error('✗ route.ts file not found');
    console.log('  Trying alternative path...');
    
    // Try alternative path
    const altRoutePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'route.ts');
    try {
      routeContent = fs.readFileSync(altRoutePath, 'utf8');
      console.log('✓ route.ts file found at alternative path');
    } catch (altError) {
      console.error('✗ route.ts file not found at alternative path either');
    }
  }
  
  // 3. Analyze auth.ts content
  console.log('\n3. Analyzing auth.ts content...');
  
  // Check for providers
  if (authContent.includes('GoogleProvider')) {
    console.log('✓ Google provider configured');
  } else {
    console.log('✗ Google provider not found');
  }
  
  if (authContent.includes('CredentialsProvider')) {
    console.log('✓ Credentials provider configured');
  } else {
    console.log('✗ Credentials provider not found');
  }
  
  // Check for session configuration
  const sessionMaxAgeMatch = authContent.match(/maxAge:\s*(\d+)/);
  if (sessionMaxAgeMatch) {
    const maxAge = parseInt(sessionMaxAgeMatch[1], 10);
    console.log(`✓ Session maxAge: ${maxAge} seconds (${Math.round(maxAge / 86400)} days)`);
  } else {
    console.log('✗ Session maxAge not explicitly set (will use default)');
  }
  
  if (authContent.includes('strategy: "jwt"')) {
    console.log('✓ Session strategy: JWT');
  } else if (authContent.includes('strategy: "database"')) {
    console.log('✓ Session strategy: Database');
  } else {
    console.log('✗ Session strategy not explicitly set (will use default JWT)');
  }
  
  // Check for callbacks
  if (authContent.includes('callbacks:')) {
    console.log('✓ Callbacks section found');
    
    if (authContent.includes('async jwt')) {
      console.log('  ✓ JWT callback configured');
    }
    
    if (authContent.includes('async session')) {
      console.log('  ✓ Session callback configured');
    }
    
    if (authContent.includes('async signIn')) {
      console.log('  ✓ SignIn callback configured');
    }
  } else {
    console.log('✗ No callbacks section found');
  }
  
  // Check for custom pages
  const pagesMatch = authContent.match(/pages:\s*{([^}]*)}/);
  if (pagesMatch) {
    console.log('✓ Custom pages configured:');
    const pagesContent = pagesMatch[1];
    
    if (pagesContent.includes('signIn:')) {
      const signInMatch = pagesContent.match(/signIn:\s*['"]([^'"]*)['"]/);
      if (signInMatch) {
        console.log(`  ✓ Custom signIn page: ${signInMatch[1]}`);
      }
    }
    
    if (pagesContent.includes('error:')) {
      const errorMatch = pagesContent.match(/error:\s*['"]([^'"]*)['"]/);
      if (errorMatch) {
        console.log(`  ✓ Custom error page: ${errorMatch[1]}`);
      }
    }
  } else {
    console.log('✗ No custom pages configured');
  }
  
  // 4. Analyze route.ts content if found
  if (routeContent) {
    console.log('\n4. Analyzing route.ts content...');
    
    // Check if it imports authOptions from auth.ts
    if (routeContent.includes('import { authOptions }') || routeContent.includes('import {authOptions}')) {
      console.log('✓ route.ts imports authOptions from auth.ts');
    } else {
      console.log('✗ route.ts does not import authOptions from auth.ts');
    }
    
    // Check for debug mode
    if (routeContent.includes('debug: true') || routeContent.includes('debug:true')) {
      console.log('✓ Debug mode is enabled');
    } else if (routeContent.includes('debug: process.env.NODE_ENV === "development"')) {
      console.log('✓ Debug mode is enabled in development environment');
    } else {
      console.log('✗ Debug mode is not explicitly enabled');
    }
    
    // Check for session maxAge in route.ts
    const routeMaxAgeMatch = routeContent.match(/maxAge:\s*(\d+)/);
    if (routeMaxAgeMatch) {
      const routeMaxAge = parseInt(routeMaxAgeMatch[1], 10);
      console.log(`✓ Session maxAge in route.ts: ${routeMaxAge} seconds (${Math.round(routeMaxAge / 86400)} days)`);
      
      // Compare with auth.ts if available
      if (sessionMaxAgeMatch) {
        const authMaxAge = parseInt(sessionMaxAgeMatch[1], 10);
        if (routeMaxAge === authMaxAge) {
          console.log('✓ Session maxAge is consistent between auth.ts and route.ts');
        } else {
          console.log('✗ Session maxAge differs between auth.ts and route.ts');
        }
      }
    }
  }
  
  // 5. Check for middleware.ts
  console.log('\n5. Checking for middleware.ts...');
  const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
  let middlewareContent;
  
  try {
    middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    console.log('✓ middleware.ts file found');
    
    // Analyze middleware content
    if (middlewareContent.includes('withAuth')) {
      console.log('✓ middleware.ts uses withAuth from next-auth/middleware');
      
      // Check for public routes
      const publicRoutesMatch = middlewareContent.match(/publicRoutes\s*=\s*\[([^\]]*)\]/);
      if (publicRoutesMatch) {
        const publicRoutes = publicRoutesMatch[1].match(/['"]([^'"]*)['"]*/g);
        if (publicRoutes && publicRoutes.length > 0) {
          console.log('✓ Public routes defined in middleware:');
          publicRoutes.forEach(route => {
            console.log(`  - ${route.replace(/['"]*/g, '')}`);
          });
        }
      }
      
      // Check for protected routes
      const protectedRoutesMatch = middlewareContent.match(/protectedRoutes\s*=\s*\[([^\]]*)\]/);
      if (protectedRoutesMatch) {
        const protectedRoutes = protectedRoutesMatch[1].match(/['"]([^'"]*)['"]*/g);
        if (protectedRoutes && protectedRoutes.length > 0) {
          console.log('✓ Protected routes defined in middleware:');
          protectedRoutes.forEach(route => {
            console.log(`  - ${route.replace(/['"]*/g, '')}`);
          });
        }
      }
    } else {
      console.log('✗ middleware.ts does not use withAuth from next-auth/middleware');
    }
  } catch (error) {
    console.error('✗ middleware.ts file not found');
  }
  
  // 6. Check for login page component
  console.log('\n6. Checking for login page component...');
  const loginPagePath = path.join(__dirname, 'src', 'app', 'login', 'page.tsx');
  
  try {
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
    console.log('✓ login/page.tsx file found');
    
    // Check for signIn import
    if (loginPageContent.includes('import { signIn }') || loginPageContent.includes('import {signIn}')) {
      console.log('✓ login page imports signIn from next-auth/react');
    } else {
      console.log('✗ login page does not import signIn from next-auth/react');
    }
    
    // Check for credentials login
    if (loginPageContent.includes('signIn("credentials"')) {
      console.log('✓ login page implements credentials authentication');
    } else {
      console.log('✗ login page does not implement credentials authentication');
    }
    
    // Check for Google login
    if (loginPageContent.includes('signIn("google"')) {
      console.log('✓ login page implements Google authentication');
    } else {
      console.log('✗ login page does not implement Google authentication');
    }
  } catch (error) {
    console.error('✗ login/page.tsx file not found');
  }
  
  console.log('\n===== Static Analysis of NextAuth Configuration Complete =====');
}

testNextAuthStatic();