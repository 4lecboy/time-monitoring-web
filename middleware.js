import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.pathname;

  // ✅ Skip API requests
  if (url.startsWith("/api")) return NextResponse.next();

  if (!token && url !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token?.role;

  if (url.startsWith("/dashboard") && !["admin", "pdd"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (url.startsWith("/time-monitoring") && role !== "agent") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employee/:path*", "/time-monitoring/:path*"],
};
