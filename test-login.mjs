// Test script to simulate a login request to the NextAuth API
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Get CSRF token first
    console.log('Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    
    console.log('CSRF response status:', csrfResponse.status);
    console.log('CSRF data:', csrfData);
    
    if (!csrfData.csrfToken) {
      console.error('Failed to get CSRF token');
      return;
    }
    
    // Attempt login
    console.log('\nAttempting login with credentials...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        csrfToken: csrfData.csrfToken,
        email: 'sebastian.cerpa@ridepanda.com',
        password: 'Ride..0106.',
        redirect: false,
        json: true
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    try {
      const loginData = await loginResponse.json();
      console.log('Login response data:', loginData);
    } catch (e) {
      console.log('Could not parse login response as JSON');
    }
    
    // Check response headers
    console.log('\nResponse headers:');
    loginResponse.headers.forEach((value, name) => {
      console.log(`${name}: ${value}`);
    });
    
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

testLogin();