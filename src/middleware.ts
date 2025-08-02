// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // If user is authenticated and trying to access login/signup, redirect to dashboard
        if (token && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true, // This runs the middleware for all routes
        },
    }
);

export const config = {
    matcher: ['/login', '/signup', '/dashboard/:path*']
};