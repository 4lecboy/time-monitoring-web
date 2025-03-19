import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.pathname;

  // ✅ Skip API requests
  if (url.startsWith("/api")) return NextResponse.next();

  // Redirect to login if no token
  if (!token && url !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token?.role;

  // ✅ Admins have full access
  if (role === "admin") return NextResponse.next();

  // ✅ PDD can access dashboard
  if (url.startsWith("/dashboard") && role === "pdd") {
    return NextResponse.next();
  }

  // ✅ Agents can only access time monitoring
  if (url.startsWith("/time-monitoring") && role === "agent") {
    return NextResponse.next();
  }

  // ❌ Redirect unauthorized users
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/employee/:path*", "/time-monitoring/:path*"],
};
