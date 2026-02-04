import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./db.js";
import { config } from "./config.js";
import type { AuthPermission, AuthRole } from "./types.js";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export function isBcryptHash(hash: string | null) {
  return Boolean(hash && hash.startsWith("$2"));
}

export async function verifyPassword(password: string, hash: string | null) {
  if (!hash) {
    return false;
  }

  if (isBcryptHash(hash)) {
    return bcrypt.compare(password, hash);
  }

  const md5 = crypto.createHash("md5").update(password).digest("hex");
  return md5 === hash;
}

export function issueToken(userId: number) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

const ADMIN_PERMISSIONS: AuthPermission[] = [
  { key: "accounts:read", description: "Read accounts" },
  { key: "accounts:write", description: "Manage accounts" },
  { key: "clients:read", description: "Read clients" },
  { key: "clients:write", description: "Manage clients" },
  { key: "attachments:read", description: "Read attachments" },
  { key: "attachments:write", description: "Manage attachments" },
  { key: "users:read", description: "Read users" },
  { key: "users:write", description: "Manage users" },
  { key: "sources:read", description: "Read external sources" },
  { key: "sources:write", description: "Manage external sources" },
  { key: "translations:read", description: "Read translations" },
  { key: "translations:write", description: "Manage translations" },
  { key: "imports:write", description: "Import clients" }
];

const USER_PERMISSIONS: AuthPermission[] = [
  { key: "clients:read", description: "Read clients" },
  { key: "attachments:read", description: "Read attachments" },
  { key: "attachments:write", description: "Manage attachments" },
  { key: "imports:write", description: "Import clients" }
];

function resolveRole(role: string): { role: AuthRole; permissions: AuthPermission[] } {
  if (role === "Administrator") {
    return {
      role: { key: "ADMIN", name: "Administrator" },
      permissions: ADMIN_PERMISSIONS
    };
  }

  return {
    role: { key: "ACCOUNT_USER", name: "Account User" },
    permissions: USER_PERMISSIONS
  };
}

export async function buildUserContext(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.active) {
    return null;
  }

  const resolved = resolveRole(user.role);
  const roles = [resolved.role];
  const permissions = resolved.permissions;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    accountId: user.accountId,
    language: user.language,
    role: user.role,
    roles,
    permissions,
    isAdmin: user.role === "Administrator"
  };
}
