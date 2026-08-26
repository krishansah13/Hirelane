import type { NextAuthConfig } from "next-auth";

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
        session.user.role = token.role as "seeker" | "employer";
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
      const isAccount = pathname.startsWith("/account");

      if ((isDashboard || isEmployer || isAccount) && !isLoggedIn) {
        return false;
      }

      if (isDashboard && role === "employer") {
        return Response.redirect(new URL("/employer", request.url));
      }

      if (isEmployer && role === "seeker") {
        return Response.redirect(new URL("/dashboard", request.url));
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
