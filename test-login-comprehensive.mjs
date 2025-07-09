// Comprehensive test script for NextAuth login functionality
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testLoginFunctionality() {
  console.log('===== Testing NextAuth Login Functionality =====\n');
  
  // 1. Check if the server is running
  console.log('1. Checking if the server is running...');
  try {
    // Try to access the CSRF endpoint instead of the root URL
    // This is more reliable for checking if the NextAuth API is available
    const serverResponse = await fetch('http://localhost:3000/api/auth/csrf', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (serverResponse.ok) {
      console.log(`✓ Server is running (Status: ${serverResponse.status})`);
    } else {
      console.log(`✗ Server is running but returned status: ${serverResponse.status}`);
      console.log('  Continuing with tests anyway...');
    }
  } catch (error) {
    console.error('✗ Server is not running or not accessible');
    console.error(`  Error: ${error.message}`);
    console.error('  Please start the server with "npm run dev" before running this test');
    // Continue anyway for debugging purposes
    console.log('  Continuing with tests for debugging purposes...');
  }
  
  // 2. Get CSRF token
  console.log('\n2. Getting CSRF token...');
  let csrfToken;
  try {
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    
    if (csrfData.csrfToken) {
      csrfToken = csrfData.csrfToken;
      console.log(`✓ CSRF token obtained: ${csrfToken.substring(0, 10)}...`);
    } else {
      console.error('✗ Failed to get CSRF token');
      return;
    }
  } catch (error) {
    console.error('✗ Error getting CSRF token:', error.message);
    return;
  }
  
  // 3. Test login with valid credentials
  console.log('\n3. Testing login with valid credentials...');
  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrfToken,
        email: 'sebastian.cerpa@ridepanda.com',
        password: 'Ride..0106.',
        redirect: false,
        json: true
      })
    });
    
    console.log(`✓ Login response status: ${loginResponse.status}`);
    
    // Check for cookies in response headers
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      console.log('✓ Session cookies received');
      
      // Check for next-auth.session-token
      if (cookies.includes('next-auth.session-token')) {
        console.log('✓ Session token cookie found');
      } else {
        console.log('✗ Session token cookie not found');
      }
      
      // Check for next-auth.csrf-token
      if (cookies.includes('next-auth.csrf-token')) {
        console.log('✓ CSRF token cookie found');
      } else {
        console.log('✗ CSRF token cookie not found');
      }
    } else {
      console.log('✗ No session cookies received');
    }
    
    // Try to parse response body
    try {
      const loginData = await loginResponse.json();
      console.log('✓ Login response data:', loginData);
      
      if (loginData.error) {
        console.log(`✗ Login error: ${loginData.error}`);
      } else if (loginData.url) {
        console.log(`✓ Redirect URL: ${loginData.url}`);
      }
    } catch (e) {
      console.log('✗ Could not parse login response as JSON');
    }
  } catch (error) {
    console.error('✗ Error during login test:', error.message);
  }
  
  // 4. Test login with invalid credentials
  console.log('\n4. Testing login with invalid credentials...');
  try {
    const invalidLoginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrfToken,
        email: 'sebastian.cerpa@ridepanda.com',
        password: 'WrongPassword123',
        redirect: false,
        json: true
      })
    });
    
    console.log(`✓ Invalid login response status: ${invalidLoginResponse.status}`);
    
    // Expected behavior: 401 Unauthorized
    if (invalidLoginResponse.status === 401) {
      console.log('✓ Correct response for invalid credentials (401 Unauthorized)');
    } else {
      console.log(`✗ Unexpected status code for invalid credentials: ${invalidLoginResponse.status}`);
    }
    
    // Try to parse response body
    try {
      const invalidLoginData = await invalidLoginResponse.json();
      console.log('✓ Invalid login response data:', invalidLoginData);
      
      if (invalidLoginData.error) {
        console.log(`✓ Error message for invalid credentials: ${invalidLoginData.error}`);
      }
    } catch (e) {
      console.log('✗ Could not parse invalid login response as JSON');
    }
  } catch (error) {
    console.error('✗ Error during invalid login test:', error.message);
  }
  
  // 5. Test session endpoint
  console.log('\n5. Testing session endpoint...');
  try {
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.json();
    
    console.log(`✓ Session response status: ${sessionResponse.status}`);
    console.log('✓ Session data:', sessionData);
    
    if (Object.keys(sessionData).length === 0) {
      console.log('✓ No active session (expected when not authenticated)');
    } else {
      console.log('✓ Active session found');
      
      if (sessionData.user) {
        console.log(`✓ User in session: ${sessionData.user.email || sessionData.user.name || 'Unknown'}`);
      }
      
      if (sessionData.expires) {
        console.log(`✓ Session expires: ${sessionData.expires}`);
      }
    }
  } catch (error) {
    console.error('✗ Error testing session endpoint:', error.message);
  }
  
  // 6. Test providers endpoint
  console.log('\n6. Testing providers endpoint...');
  try {
    const providersResponse = await fetch('http://localhost:3000/api/auth/providers');
    const providersData = await providersResponse.json();
    
    console.log(`✓ Providers response status: ${providersResponse.status}`);
    console.log('✓ Available providers:', Object.keys(providersData).join(', '));
    
    // Check for credentials provider
    if (providersData.credentials) {
      console.log('✓ Credentials provider is available');
    } else {
      console.log('✗ Credentials provider is not available');
    }
    
    // Check for Google provider
    if (providersData.google) {
      console.log('✓ Google provider is available');
    } else {
      console.log('✗ Google provider is not available');
    }
  } catch (error) {
    console.error('✗ Error testing providers endpoint:', error.message);
  }
  
  console.log('\n===== NextAuth Login Functionality Test Complete =====');
}

testLoginFunctionality();