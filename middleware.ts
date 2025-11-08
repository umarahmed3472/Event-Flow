import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.isAdmin;
    const pathname = req.nextUrl.pathname;

    console.log('[MIDDLEWARE] pathname:', pathname);
    console.log('[MIDDLEWARE] token exists:', !!token);
    if (token) {
      console.log('[MIDDLEWARE] token.id:', token.id);
      console.log('[MIDDLEWARE] token.email:', token.email);
      console.log('[MIDDLEWARE] token.phoneE164:', token.phoneE164);
    }

    // Check if authenticated user needs to add phone number (only for protected routes)
    if (token && !token.phoneE164 && pathname !== '/add-phone' && 
        pathname !== '/' && pathname !== '/login' && pathname !== '/register' && 
        !pathname.startsWith('/api/')) {
      console.log('[MIDDLEWARE] User needs phone number - redirecting to add-phone');
      return NextResponse.redirect(new URL('/add-phone', req.url));
    }

    // Block non-admins from admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        console.log('[MIDDLEWARE AUTH] pathname:', pathname);
        console.log('[MIDDLEWARE AUTH] token exists:', !!token);

        // Allow public routes and auth pages
        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname === '/add-phone' ||
          pathname.startsWith('/api/')
        ) {
          console.log('[MIDDLEWARE AUTH] Public route - allowing');
          return true;
        }

        // Require authentication for all other routes
        const isAuthorized = !!token;
        console.log('[MIDDLEWARE AUTH] Protected route - authorized:', isAuthorized);
        return isAuthorized;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
