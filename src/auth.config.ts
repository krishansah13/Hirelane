import type { NextAuthConfig } from "next-auth";
import { getHomePath, type UserRole } from "./lib/roles";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.companyId = (token.companyId as string | null) ?? null;
      }
      return session;
    },

    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isDashboard = pathname.startsWith("/dashboard");
      const isEmployer = pathname.startsWith("/employer");
      const isAdmin = pathname.startsWith("/admin");

      if ((isDashboard || isEmployer || isAdmin) && !isLoggedIn) {
        return false;
      }

      if (isDashboard && role !== "seeker") {
        return Response.redirect(new URL(getHomePath(role), request.url));
      }

      if (isEmployer && role !== "employer") {
        return Response.redirect(new URL(getHomePath(role), request.url));
      }

      if (isAdmin && role !== "admin") {
        return Response.redirect(new URL(getHomePath(role), request.url));
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
