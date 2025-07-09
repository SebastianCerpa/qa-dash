import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/users',
  '/test-plans'
];

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (req.nextauth.token && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!req.nextauth.token && 
        !publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without authentication
        if (publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route))) {
          return true;
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