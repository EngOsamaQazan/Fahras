import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  remoteSources: {
    zajal: process.env.REMOTE_ZAJAL_URL ?? "",
    jadal: process.env.REMOTE_JADAL_URL ?? "",
    namaa: process.env.REMOTE_NAMAA_URL ?? "",
    bseel: process.env.REMOTE_BSEEL_URL ?? ""
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    bucket: process.env.SUPABASE_BUCKET ?? "attachments",
    storagePrivate: process.env.SUPABASE_STORAGE_PRIVATE === "1",
    signedUrlTtl: Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL ?? 3600)
  }
};
