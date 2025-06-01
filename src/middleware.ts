import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isPublicRoute =
    pathname === "/login" || pathname === "/register" || isApiRoute;

  // CORS para requisições API
  if (isApiRoute) {
    // Se for preflight, responde direto
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Ignora autenticação em rotas públicas
  if (
    isPublicRoute ||
    isAuthRoute ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    const response = NextResponse.next();
    if (isApiRoute) {
      addCorsHeaders(response, request);
    }
    return response;
  }

  // Se não tiver sessão, redireciona para login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (isApiRoute) {
    addCorsHeaders(response, request);
  }
  return response;
}

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const headers = corsHeaders(request);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
