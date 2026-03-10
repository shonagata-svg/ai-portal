import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Skip Basic Auth for the revalidation webhook endpoint
  if (req.nextUrl.pathname === "/api/revalidate") {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER ?? "admin";
  const pass = process.env.BASIC_AUTH_PASSWORD ?? "";

  if (!pass) return NextResponse.next(); // password not set → skip auth

  const auth = req.headers.get("authorization");
  if (auth) {
    const [, encoded] = auth.split(" ");
    const decoded = atob(encoded ?? "");
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="HERALBONY AI Portal"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
