import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If user is not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { role } = token;
  const pathname = req.nextUrl.pathname;

  // Define protected routes by role
  const adminRoutes = ["/admin/dashboard", "/admin/reports"];
  const agentRoutes = ["/time-monitoring"];

  if (adminRoutes.includes(pathname) && role !== "admin" && role !== "pdd") {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect unauthorized users
  }

  if (agentRoutes.includes(pathname) && role !== "agent") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Define protected paths
export const config = {
  matcher: ["/admin/:path*", "/time-monitoring"],
};
