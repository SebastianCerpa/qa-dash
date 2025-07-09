// Test script to verify NextAuth configuration
const fs = require('fs');
const path = require('path');

function testNextAuthConfig() {
  console.log('===== Testing NextAuth Configuration =====');
  
  // Read the auth.ts file
  const authFilePath = path.join(__dirname, 'lib', 'auth.ts');
  const routeFilePath = path.join(__dirname, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
  const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
  
  console.log('\n1. Reading auth configuration files...');
  
  // Test auth.ts file
  try {
    const authFileContent = fs.readFileSync(authFilePath, 'utf8');
    console.log('✓ Auth.ts file exists');
    
    // Check providers
    console.log('\n2. Checking auth providers...');
    const googleProviderMatch = authFileContent.includes('GoogleProvider');
    const credentialsProviderMatch = authFileContent.includes('CredentialsProvider');
    
    console.log(`✓ Google Provider: ${googleProviderMatch ? 'Configured' : 'Not configured'}`);
    console.log(`✓ Credentials Provider: ${credentialsProviderMatch ? 'Configured' : 'Not configured'}`);
    
    // Check session configuration in auth.ts
    console.log('\n3. Checking session configuration in auth.ts...');
    const sessionConfigMatch = authFileContent.match(/session:\s*{[^}]*maxAge:\s*([^,\n]*)/s);
    const sessionStrategyMatch = authFileContent.match(/strategy:\s*"([^"]*)"/s);
    const sessionUpdateAgeMatch = authFileContent.match(/updateAge:\s*([^,\n]*)/s);
    
    if (sessionConfigMatch) {
      console.log(`✓ Session maxAge: ${sessionConfigMatch[1].trim()}`);
    } else {
      console.log('✗ Session maxAge not found');
    }
    
    if (sessionStrategyMatch) {
      console.log(`✓ Session strategy: ${sessionStrategyMatch[1].trim()}`);
    } else {
      console.log('✗ Session strategy not found');
    }
    
    if (sessionUpdateAgeMatch) {
      console.log(`✓ Session updateAge: ${sessionUpdateAgeMatch[1].trim()}`);
    } else {
      console.log('✗ Session updateAge not found');
    }
    
    // Check debug mode
    const debugModeMatch = authFileContent.match(/debug:\s*([^,\n]*)/s);
    if (debugModeMatch) {
      console.log(`✓ Debug mode: ${debugModeMatch[1].trim()}`);
    } else {
      console.log('✗ Debug mode not found');
    }
    
    // Check callbacks
    console.log('\n4. Checking auth callbacks...');
    const jwtCallbackMatch = authFileContent.includes('jwt({');
    const sessionCallbackMatch = authFileContent.includes('session({');
    const redirectCallbackMatch = authFileContent.includes('redirect({');
    
    console.log(`✓ JWT Callback: ${jwtCallbackMatch ? 'Configured' : 'Not configured'}`);
    console.log(`✓ Session Callback: ${sessionCallbackMatch ? 'Configured' : 'Not configured'}`);
    console.log(`✓ Redirect Callback: ${redirectCallbackMatch ? 'Configured' : 'Not configured'}`);
    
    // Check custom pages
    console.log('\n5. Checking custom pages configuration...');
    const customPagesMatch = authFileContent.match(/pages:\s*{([^}]*)}/s);
    if (customPagesMatch) {
      console.log(`✓ Custom pages configured: ${customPagesMatch[1].trim()}`);
    } else {
      console.log('✗ Custom pages not configured');
    }
    
  } catch (error) {
    console.error('Error reading auth.ts file:', error.message);
  }
  
  // Test route.ts file
  try {
    const routeFileContent = fs.readFileSync(routeFilePath, 'utf8');
    console.log('\n6. Checking route.ts configuration...');
    console.log('✓ Route.ts file exists');
    
    // Check if route.ts imports from auth.ts
    const importMatch = routeFileContent.match(/import\s*{\s*authOptions\s*}\s*from/s);
    if (importMatch) {
      console.log('✓ Route.ts imports authOptions from auth.ts');
    } else {
      console.log('✗ Route.ts does not import authOptions from auth.ts');
    }
    
    // Check session configuration in route.ts
    const sessionConfigMatch = routeFileContent.match(/authOptions\.session\s*=\s*{[^}]*maxAge:\s*([^,\n]*)/s);
    if (sessionConfigMatch) {
      console.log(`✓ Session maxAge in route.ts: ${sessionConfigMatch[1].trim()}`);
    } else {
      console.log('✗ Session maxAge not found in route.ts');
    }
    
    const debugModeMatch = routeFileContent.match(/authOptions\.debug\s*=\s*([^;\n]*)/s);
    if (debugModeMatch) {
      console.log(`✓ Debug mode in route.ts: ${debugModeMatch[1].trim()}`);
    } else {
      console.log('✗ Debug mode not found in route.ts');
    }
    
    // Check if there are any discrepancies between auth.ts and route.ts
    console.log('\n7. Checking for configuration discrepancies...');
    const authFileContent = fs.readFileSync(authFilePath, 'utf8');
    const authSessionMaxAgeMatch = authFileContent.match(/session:\s*{[^}]*maxAge:\s*([^,\n]*)/s);
    const routeSessionMaxAgeMatch = routeFileContent.match(/authOptions\.session\s*=\s*{[^}]*maxAge:\s*([^,\n]*)/s);
    
    if (authSessionMaxAgeMatch && routeSessionMaxAgeMatch) {
      const authMaxAge = authSessionMaxAgeMatch[1].trim();
      const routeMaxAge = routeSessionMaxAgeMatch[1].trim();
      
      if (authMaxAge === routeMaxAge) {
        console.log('✓ Session maxAge is consistent between auth.ts and route.ts');
      } else {
        console.log(`✗ Session maxAge discrepancy: auth.ts (${authMaxAge}) vs route.ts (${routeMaxAge})`);
      }
    }
  } catch (error) {
    console.error('Error reading route.ts file:', error.message);
  }
  
  // Test middleware.ts file
  try {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    console.log('\n8. Checking middleware configuration...');
    console.log('✓ Middleware.ts file exists');
    
    // Check if middleware is using withAuth
    const withAuthMatch = middlewareContent.includes('withAuth');
    if (withAuthMatch) {
      console.log('✓ Middleware is using withAuth from next-auth');
    } else {
      console.log('✗ Middleware is not using withAuth');
    }
    
    // Check protected routes logic
    const protectedRoutesMatch = middlewareContent.includes('!req.nextauth.token');
    if (protectedRoutesMatch) {
      console.log('✓ Middleware has logic for protected routes');
    } else {
      console.log('✗ Middleware does not have logic for protected routes');
    }
    
    // Check public routes
    const publicRoutesMatch = middlewareContent.match(/req\.nextUrl\.pathname\s*===\s*'\/login'/s);
    if (publicRoutesMatch) {
      console.log('✓ Middleware has logic for public routes');
    } else {
      console.log('✗ Middleware does not have logic for public routes');
    }
  } catch (error) {
    console.error('Error reading middleware.ts file:', error.message);
  }
  
  console.log('\n===== NextAuth Configuration Test Complete =====');
}

testNextAuthConfig();