import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLE_HOME, type Role } from "@/data/constants/roles";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as Role | undefined;
    const seg = req.nextUrl.pathname.split("/")[1]?.toUpperCase();
    if (role && ["ADMIN", "CUSTOMER", "DRIVER", "VENDOR"].includes(seg) && seg !== role)
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);
export const config = { matcher: ["/admin/:path*", "/customer/:path*", "/driver/:path*", "/vendor/:path*", "/messages/:path*", "/notifications/:path*", "/profile/:path*", "/support/:path*", "/dashboard-home"] };
