// Comprehensive diagnostic tool for NextAuth configuration
const fs = require('fs');
const path = require('path');

async function diagnoseNextAuth() {
  console.log('===== NextAuth Configuration Diagnostic Tool =====\n');
  
  const issues = [];
  const warnings = [];
  const recommendations = [];
  
  // 1. Check for required files
  console.log('1. Checking for required files...');
  const authPath = path.join(__dirname, 'lib', 'auth.ts');
  let authContent;
  
  try {
    authContent = fs.readFileSync(authPath, 'utf8');
    console.log('✓ auth.ts file found');
  } catch (error) {
    console.error('✗ auth.ts file not found');
    issues.push('auth.ts file is missing');
    return;
  }
  
  // Check for route.ts file
  const routePath = path.join(__dirname, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
  let routeContent;
  let routeFound = false;
  
  try {
    routeContent = fs.readFileSync(routePath, 'utf8');
    console.log('✓ route.ts file found');
    routeFound = true;
  } catch (error) {
    console.log('✗ route.ts file not found at primary location');
    
    // Try alternative path
    const altRoutePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'route.ts');
    try {
      routeContent = fs.readFileSync(altRoutePath, 'utf8');
      console.log('✓ route.ts file found at alternative path');
      routeFound = true;
    } catch (altError) {
      console.error('✗ route.ts file not found at alternative path either');
      issues.push('route.ts file is missing');
    }
  }
  
  // Check for middleware.ts
  const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
  let middlewareContent;
  let middlewareFound = false;
  
  try {
    middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    console.log('✓ middleware.ts file found');
    middlewareFound = true;
  } catch (error) {
    console.error('✗ middleware.ts file not found');
    warnings.push('middleware.ts file is missing - authentication protection may not be enforced');
  }
  
  // Check for login page
  const loginPagePath = path.join(__dirname, 'src', 'app', 'login', 'page.tsx');
  let loginPageContent;
  let loginPageFound = false;
  
  try {
    loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
    console.log('✓ login/page.tsx file found');
    loginPageFound = true;
  } catch (error) {
    console.error('✗ login/page.tsx file not found');
    warnings.push('login/page.tsx file is missing - custom login page may not be properly configured');
  }
  
  // 2. Analyze auth.ts content
  console.log('\n2. Analyzing auth.ts configuration...');
  
  // Check for providers
  const googleProviderConfigured = authContent.includes('GoogleProvider');
  const credentialsProviderConfigured = authContent.includes('CredentialsProvider');
  
  if (googleProviderConfigured) {
    console.log('✓ Google provider configured');
    
    // Check for environment variables
    if (!authContent.includes('GOOGLE_CLIENT_ID') || !authContent.includes('GOOGLE_CLIENT_SECRET')) {
      console.log('✗ Google provider environment variables not properly referenced');
      issues.push('Google provider is configured but GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables may not be properly referenced');
    }
  } else {
    console.log('✗ Google provider not configured');
    warnings.push('Google provider is not configured - social login will not be available');
  }
  
  if (credentialsProviderConfigured) {
    console.log('✓ Credentials provider configured');
    
    // Check for proper password comparison
    if (!authContent.includes('bcrypt.compare') && !authContent.includes('bcryptjs.compare')) {
      console.log('✗ Secure password comparison not found in credentials provider');
      issues.push('Credentials provider may not be using secure password comparison (bcrypt.compare)');
    }
  } else {
    console.log('✗ Credentials provider not configured');
    warnings.push('Credentials provider is not configured - email/password login will not be available');
  }
  
  // Check for session configuration
  // Look for maxAge with calculation (e.g., 30 * 24 * 60 * 60) or direct number
  const sessionMaxAgeMatch = authContent.match(/maxAge:\s*([\d*\s*+\s*\d*\s*]*\d+)/);
  let authMaxAge = 0;
  
  if (sessionMaxAgeMatch) {
    const maxAgeStr = sessionMaxAgeMatch[1].trim();
    
    // Handle calculation expressions like "30 * 24 * 60 * 60"
    if (maxAgeStr.includes('*')) {
      try {
        // Safely evaluate the expression
        authMaxAge = eval(maxAgeStr);
        const days = Math.round(authMaxAge / 86400);
        console.log(`✓ Session maxAge: ${authMaxAge} seconds (${days} days) [from calculation: ${maxAgeStr}]`);
        
        if (days < 1) {
          warnings.push(`Session maxAge is very short (${authMaxAge} seconds) - users will be logged out frequently`);
        } else if (days > 30) {
          warnings.push(`Session maxAge is very long (${days} days) - consider a shorter session for security`);
        }
      } catch (error) {
        console.log(`✗ Could not parse session maxAge expression: ${maxAgeStr}`);
        warnings.push(`Could not parse session maxAge expression: ${maxAgeStr}`);
      }
    } else {
      // Direct number
      authMaxAge = parseInt(maxAgeStr, 10);
      const days = Math.round(authMaxAge / 86400);
      console.log(`✓ Session maxAge: ${authMaxAge} seconds (${days} days)`);
      
      if (days < 1) {
        warnings.push(`Session maxAge is very short (${authMaxAge} seconds) - users will be logged out frequently`);
      } else if (days > 30) {
        warnings.push(`Session maxAge is very long (${days} days) - consider a shorter session for security`);
      }
    }
  } else {
    console.log('✗ Session maxAge not explicitly set (will use default)');
    recommendations.push('Consider setting an explicit session maxAge for better control over session lifetime');
  }
  
  // Check session strategy
  if (authContent.includes('strategy: "jwt"')) {
    console.log('✓ Session strategy: JWT');
  } else if (authContent.includes('strategy: "database"')) {
    console.log('✓ Session strategy: Database');
    
    // Check for adapter configuration if using database strategy
    if (!authContent.includes('adapter:')) {
      console.log('✗ Database strategy selected but no adapter configured');
      issues.push('Database session strategy is selected but no adapter is configured');
    }
  } else {
    console.log('✗ Session strategy not explicitly set (will use default JWT)');
    recommendations.push('Consider setting an explicit session strategy for clarity');
  }
  
  // Check for callbacks
  if (authContent.includes('callbacks:')) {
    console.log('✓ Callbacks section found');
    
    // JWT callback
    if (authContent.includes('async jwt')) {
      console.log('  ✓ JWT callback configured');
    } else if (authContent.includes('strategy: "jwt"') || !authContent.includes('strategy:')) {
      console.log('  ✗ JWT callback not configured but JWT strategy is used');
      recommendations.push('Consider implementing a JWT callback for better control over token content');
    }
    
    // Session callback
    if (authContent.includes('async session')) {
      console.log('  ✓ Session callback configured');
    } else {
      console.log('  ✗ Session callback not configured');
      recommendations.push('Consider implementing a session callback for better control over session content');
    }
  } else {
    console.log('✗ No callbacks section found');
    recommendations.push('Consider implementing callbacks for better control over authentication flow');
  }
  
  // Check for custom pages
  const pagesMatch = authContent.match(/pages:\s*{([^}]*)}/);
  if (pagesMatch) {
    console.log('✓ Custom pages configured');
    const pagesContent = pagesMatch[1];
    
    // Check signIn page
    const signInMatch = pagesContent.match(/signIn:\s*['"]([^'"]*)['"]/);
    if (signInMatch) {
      const signInPage = signInMatch[1];
      console.log(`  ✓ Custom signIn page: ${signInPage}`);
      
      // Verify the signIn page exists
      if (signInPage === '/login' && !loginPageFound) {
        console.log('  ✗ Custom signIn page is set to /login but login/page.tsx was not found');
        issues.push('Custom signIn page is configured but the page file was not found');
      }
    } else {
      console.log('  ✗ Custom signIn page not configured');
      recommendations.push('Consider configuring a custom signIn page for better user experience');
    }
    
    // Check for other custom pages
    if (!pagesContent.includes('error:')) {
      console.log('  ✗ Custom error page not configured');
      recommendations.push('Consider configuring a custom error page for better user experience');
    }
    
    if (!pagesContent.includes('signOut:')) {
      console.log('  ✗ Custom signOut page not configured');
      recommendations.push('Consider configuring a custom signOut page for better user experience');
    }
  } else {
    console.log('✗ No custom pages configured');
    recommendations.push('Consider configuring custom pages for better user experience');
  }
  
  // 3. Analyze route.ts content if found
  if (routeFound && routeContent) {
    console.log('\n3. Analyzing route.ts configuration...');
    
    // Check if it imports authOptions from auth.ts
    const importsAuthOptions = routeContent.includes('import { authOptions }') || 
                              routeContent.includes('import {authOptions}') ||
                              routeContent.includes('import authOptions');
    
    if (importsAuthOptions) {
      console.log('✓ route.ts imports authOptions from auth.ts');
    } else {
      console.log('✗ route.ts does not import authOptions from auth.ts');
      issues.push('route.ts does not import authOptions from auth.ts - configuration may be inconsistent');
    }
    
    // Check for debug mode
    if (routeContent.includes('debug: true') || routeContent.includes('debug:true')) {
      console.log('✓ Debug mode is enabled');
      warnings.push('Debug mode is enabled - should be disabled in production');
    } else if (routeContent.includes('debug: process.env.NODE_ENV === "development"')) {
      console.log('✓ Debug mode is enabled in development environment only');
    } else {
      console.log('✗ Debug mode is not explicitly enabled');
    }
    
    // Check for session maxAge in route.ts
    // Look for maxAge with calculation (e.g., 30 * 24 * 60 * 60) or direct number
    const routeMaxAgeMatch = routeContent.match(/maxAge:\s*([\d*\s*+\s*\d*\s*]*\d+)/);
    if (routeMaxAgeMatch) {
      const maxAgeStr = routeMaxAgeMatch[1].trim();
      let routeMaxAge = 0;
      
      // Handle calculation expressions like "30 * 24 * 60 * 60"
      if (maxAgeStr.includes('*')) {
        try {
          // Safely evaluate the expression
          routeMaxAge = eval(maxAgeStr);
          const days = Math.round(routeMaxAge / 86400);
          console.log(`✓ Session maxAge in route.ts: ${routeMaxAge} seconds (${days} days) [from calculation: ${maxAgeStr}]`);
        } catch (error) {
          console.log(`✗ Could not parse session maxAge expression in route.ts: ${maxAgeStr}`);
          warnings.push(`Could not parse session maxAge expression in route.ts: ${maxAgeStr}`);
        }
      } else {
        // Direct number
        routeMaxAge = parseInt(maxAgeStr, 10);
        const days = Math.round(routeMaxAge / 86400);
        console.log(`✓ Session maxAge in route.ts: ${routeMaxAge} seconds (${days} days)`);
      }
      
      // Compare with auth.ts if available
      if (sessionMaxAgeMatch && routeMaxAge > 0) {
        if (routeMaxAge === authMaxAge) {
          console.log('✓ Session maxAge is consistent between auth.ts and route.ts');
        } else {
          console.log('✗ Session maxAge differs between auth.ts and route.ts');
          issues.push(`Session maxAge is inconsistent: ${authMaxAge} seconds in auth.ts vs ${routeMaxAge} seconds in route.ts`);
        }
      }
    }
    
    // Check for updateAge
    const updateAgeMatch = routeContent.match(/updateAge:\s*(\d+)/);
    if (updateAgeMatch) {
      const updateAge = parseInt(updateAgeMatch[1], 10);
      const hours = Math.round(updateAge / 3600);
      console.log(`✓ Session updateAge: ${updateAge} seconds (${hours} hours)`);
      
      if (sessionMaxAgeMatch) {
        const maxAge = parseInt(sessionMaxAgeMatch[1], 10);
        if (updateAge >= maxAge) {
          console.log('✗ updateAge is greater than or equal to maxAge');
          issues.push('Session updateAge should be less than maxAge');
        } else if (updateAge < maxAge / 24) {
          console.log('✗ updateAge is very small compared to maxAge');
          warnings.push('Session updateAge is very small compared to maxAge - may cause frequent token refreshes');
        }
      }
    } else {
      console.log('✗ Session updateAge not explicitly set (will use default)');
      recommendations.push('Consider setting an explicit session updateAge for better control over token refresh');
    }
  }
  
  // 4. Analyze middleware.ts if found
  if (middlewareFound && middlewareContent) {
    console.log('\n4. Analyzing middleware.ts configuration...');
    
    // Check for withAuth usage
    if (middlewareContent.includes('withAuth')) {
      console.log('✓ middleware.ts uses withAuth from next-auth/middleware');
      
      // Check for matcher configuration
      if (middlewareContent.includes('export const config = {') && middlewareContent.includes('matcher:')) {
        console.log('✓ Middleware matcher configuration found');
      } else {
        console.log('✗ Middleware matcher configuration not found');
        warnings.push('Middleware does not have a matcher configuration - may be applied to all routes unnecessarily');
      }
      
      // Check for public routes
      const publicRoutesMatch = middlewareContent.match(/publicRoutes\s*=\s*\[([^\]]*)\]/);
      if (publicRoutesMatch) {
        const publicRoutes = publicRoutesMatch[1].match(/['"]([^'"]*)['"]*/g);
        if (publicRoutes && publicRoutes.length > 0) {
          console.log(`✓ ${publicRoutes.length} public routes defined in middleware`);
          
          // Check if login page is in public routes
          const hasLoginRoute = publicRoutes.some(route => 
            route.replace(/['"]*/g, '').includes('/login') || 
            route.replace(/['"]*/g, '').includes('/auth')
          );
          
          if (!hasLoginRoute) {
            console.log('✗ Login page not found in public routes');
            issues.push('Login page is not included in public routes - users may not be able to access the login page');
          }
        }
      } else {
        console.log('✗ No public routes defined in middleware');
        warnings.push('No public routes defined in middleware - all routes may require authentication');
      }
      
      // Check for protected routes
      const protectedRoutesMatch = middlewareContent.match(/protectedRoutes\s*=\s*\[([^\]]*)\]/);
      if (protectedRoutesMatch) {
        const protectedRoutes = protectedRoutesMatch[1].match(/['"]([^'"]*)['"]*/g);
        if (protectedRoutes && protectedRoutes.length > 0) {
          console.log(`✓ ${protectedRoutes.length} protected routes defined in middleware`);
        }
      } else {
        console.log('✗ No protected routes explicitly defined in middleware');
      }
    } else {
      console.log('✗ middleware.ts does not use withAuth from next-auth/middleware');
      issues.push('Middleware does not use withAuth - authentication protection may not be enforced');
    }
  }
  
  // 5. Analyze login page if found
  if (loginPageFound && loginPageContent) {
    console.log('\n5. Analyzing login page implementation...');
    
    // Check for signIn import
    const importsSignIn = loginPageContent.includes('import { signIn }') || 
                         loginPageContent.includes('import {signIn}') ||
                         loginPageContent.includes('from "next-auth/react"');
    
    if (importsSignIn) {
      console.log('✓ Login page imports from next-auth/react');
    } else {
      console.log('✗ Login page does not import from next-auth/react');
      issues.push('Login page does not import from next-auth/react - authentication may not work properly');
    }
    
    // Check for credentials login
    if (loginPageContent.includes('signIn("credentials"') || loginPageContent.includes('signIn(\'credentials\'')) {
      console.log('✓ Login page implements credentials authentication');
      
      // Check for redirect handling
      if (!loginPageContent.includes('redirect: false')) {
        console.log('✗ Login page does not handle redirects manually');
        recommendations.push('Consider setting redirect: false and handling redirects manually for better error handling');
      }
      
      // Check for error handling
      if (loginPageContent.includes('error:') && 
          (loginPageContent.includes('setError(') || loginPageContent.includes('setErrors('))) {
        console.log('✓ Login page implements error handling');
      } else {
        console.log('✗ Login page may not properly handle authentication errors');
        recommendations.push('Consider implementing proper error handling for failed authentication attempts');
      }
    } else if (credentialsProviderConfigured) {
      console.log('✗ Credentials provider is configured but login page does not implement it');
      issues.push('Credentials provider is configured but login page does not implement it');
    }
    
    // Check for Google login
    if (loginPageContent.includes('signIn("google"') || loginPageContent.includes('signIn(\'google\'')) {
      console.log('✓ Login page implements Google authentication');
    } else if (googleProviderConfigured) {
      console.log('✗ Google provider is configured but login page does not implement it');
      issues.push('Google provider is configured but login page does not implement it');
    }
  }
  
  // 6. Check for environment variables
  console.log('\n6. Checking for environment variables...');
  const envPath = path.join(__dirname, '.env');
  const envLocalPath = path.join(__dirname, '.env.local');
  let envContent = '';
  let envLocalContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✓ .env file found');
  } catch (error) {
    console.log('✗ .env file not found');
  }
  
  try {
    envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('✓ .env.local file found');
  } catch (error) {
    console.log('✗ .env.local file not found');
  }
  
  const combinedEnv = envContent + '\n' + envLocalContent;
  
  // Check for required environment variables
  if (combinedEnv.includes('NEXTAUTH_SECRET')) {
    console.log('✓ NEXTAUTH_SECRET is defined');
  } else {
    console.log('✗ NEXTAUTH_SECRET is not defined');
    issues.push('NEXTAUTH_SECRET is not defined - JWT signing will use a default insecure secret');
  }
  
  if (combinedEnv.includes('NEXTAUTH_URL')) {
    console.log('✓ NEXTAUTH_URL is defined');
  } else {
    console.log('✗ NEXTAUTH_URL is not defined');
    warnings.push('NEXTAUTH_URL is not defined - callback URLs may not work correctly in production');
  }
  
  if (googleProviderConfigured) {
    if (combinedEnv.includes('GOOGLE_CLIENT_ID') && combinedEnv.includes('GOOGLE_CLIENT_SECRET')) {
      console.log('✓ Google OAuth environment variables are defined');
    } else {
      console.log('✗ Google OAuth environment variables are not defined');
      issues.push('Google provider is configured but GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined');
    }
  }
  
  // 7. Summary of findings
  console.log('\n===== NextAuth Configuration Diagnostic Summary =====');
  
  if (issues.length > 0) {
    console.log('\nIssues Found:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✓ No critical issues found');
  }
  
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  } else {
    console.log('\n✓ No warnings found');
  }
  
  if (recommendations.length > 0) {
    console.log('\nRecommendations:');
    recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
  } else {
    console.log('\n✓ No recommendations');
  }
  
  console.log('\n===== NextAuth Configuration Diagnostic Complete =====');
}

diagnoseNextAuth();