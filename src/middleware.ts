import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-secret-key-change-in-production"
);

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth"];

async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") // files with extensions like .png, .css
  ) {
    return NextResponse.next();
  }

  // Check if this is a public API path
  const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const userId = token ? await verifyToken(token) : null;

  // Handle public pages
  if (isPublicPage) {
    // If already logged in, redirect to home
    if (userId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Handle public API paths
  if (isPublicApi) {
    return NextResponse.next();
  }

  // No valid token - redirect to login
  if (!userId) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    // For pages, redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject user id into headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
