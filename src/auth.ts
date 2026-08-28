import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import User from "./lib/models/User";
import { connectToDatabase } from "./lib/utils/db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();

        await connectToDatabase();

        const user = await User.findOne({ email });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        if (user.status === "suspended") {
          throw new Error("ACCOUNT_SUSPENDED");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role,
          companyId: user.companyId ? user.companyId.toString() : null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
