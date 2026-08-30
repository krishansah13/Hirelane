import type { NextAuthConfig } from "next-auth";
import { getHomePath, type UserRole } from "./lib/roles";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId ?? null;
        token.picture = user.image ?? token.picture;
        token.name = user.name;
      }

      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if ("image" in session) token.picture = session.image ?? undefined;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.companyId = (token.companyId as string | null) ?? null;
        session.user.name = token.name;
        session.user.image = (token.picture as string | undefined) ?? null;
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
      const isAccount = pathname.startsWith("/account");

      if (pathname === "/" && isLoggedIn) {
        return Response.redirect(new URL(getHomePath(role), request.url));
      }

      if (
        pathname.startsWith("/jobs") &&
        (role === "employer" || role === "admin")
      ) {
        return Response.redirect(new URL(getHomePath(role), request.url));
      }

      if ((isDashboard || isEmployer || isAdmin || isAccount) && !isLoggedIn) {
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
