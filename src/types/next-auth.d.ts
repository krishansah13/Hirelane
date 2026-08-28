import "next-auth";
import "next-auth/jwt";

import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    companyId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    companyId?: string | null;
  }
}
