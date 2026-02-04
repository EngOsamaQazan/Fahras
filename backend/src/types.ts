import type { User } from "@prisma/client";

export type AuthRole = {
  key: string;
  name: string;
};

export type AuthPermission = {
  key: string;
  description: string;
};

export type AuthUser = Pick<User, "id" | "username" | "name" | "accountId" | "language" | "role"> & {
  roles: AuthRole[];
  permissions: AuthPermission[];
  isAdmin: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
