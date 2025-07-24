import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/users'
];

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/test-plans',
  '/api/test-cases',
  '/api/bugs'
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (req.nextauth.token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check if it's a protected API route
    const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
    
    // If it's a protected API route and user is not authenticated, return 401
    if (isProtectedApiRoute && !req.nextauth.token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!req.nextauth.token && 
        !publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes without authentication
        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
          return true;
        }
        
        // For protected API routes, require authentication
        const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));
        if (isProtectedApiRoute) {
          return !!token;
        }
        
        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
