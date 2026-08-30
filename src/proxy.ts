import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/",
    "/jobs",
    "/jobs/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/employer",
    "/employer/:path*",
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
  ],
};
