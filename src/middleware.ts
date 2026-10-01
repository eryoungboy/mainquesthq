import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.AUTH_SECRET || "fallback-secret-for-development-only";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')?.value;
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      await jwtVerify(session, key, { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch (err) {
      // Invalid or expired token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // If hitting login page while already authenticated, redirect to admin
  if (path === '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    if (session) {
      try {
        await jwtVerify(session, key, { algorithms: ["HS256"] });
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (err) {
        // Token is invalid, let them login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}
