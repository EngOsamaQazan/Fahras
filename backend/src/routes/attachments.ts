import { Router } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { config } from "../config.js";
import { supabase } from "../supabase.js";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

function makeStoragePath(clientId: number, originalName: string) {
  const ext = path.extname(originalName) || "";
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${clientId}/${Date.now()}-${safe}${ext}`;
}

async function buildUrl(filename: string) {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;

  if (config.supabase.storagePrivate) {
    const signed = await supabase
      .storage
      .from(config.supabase.bucket)
      .createSignedUrl(filename, config.supabase.signedUrlTtl);
    return signed.data?.signedUrl ?? "";
  }

  const { data } = supabase.storage.from(config.supabase.bucket).getPublicUrl(filename);
  return data.publicUrl;
}

router.get("/clients/:clientId", requireAuth, requirePermission("attachments:read"), async (req, res) => {
  const clientId = Number(req.params.clientId);
  const user = req.user!;
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return res.status(404).json({ message: "Not found" });
  }
  if (!user.isAdmin && client.accountId !== user.accountId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const attachments = await prisma.attachment.findMany({
    where: { clientId },
    orderBy: { id: "desc" }
  });
  const data = await Promise.all(
    attachments.map(async (item) => ({
      ...item,
      url: await buildUrl(item.filename)
    }))
  );
  return res.json({ data });
});

router.post(
  "/clients/:clientId",
  requireAuth,
  requirePermission("attachments:write"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "File missing" });
    }

    const clientId = Number(req.params.clientId);
    const user = req.user!;
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ message: "Not found" });
    }
    if (!user.isAdmin && client.accountId !== user.accountId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const storagePath = makeStoragePath(clientId, req.file.originalname);
    const uploadResult = await supabase.storage.from(config.supabase.bucket).upload(
      storagePath,
      req.file.buffer,
      { contentType: req.file.mimetype }
    );

    if (uploadResult.error) {
      return res.status(500).json({ message: "Storage upload failed" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        clientId,
        filename: storagePath
      }
    });

    return res.status(201).json({ data: { ...attachment, url: await buildUrl(attachment.filename) } });
  }
);

router.delete("/:id", requireAuth, requirePermission("attachments:write"), async (req, res) => {
  const id = Number(req.params.id);
  const user = req.user!;
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) {
    return res.status(404).json({ message: "Not found" });
  }

  if (!user.isAdmin) {
    const client = await prisma.client.findUnique({ where: { id: attachment.clientId } });
    if (!client || client.accountId !== user.accountId) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  await prisma.attachment.delete({ where: { id } });
  await supabase.storage.from(config.supabase.bucket).remove([attachment.filename]);
  return res.status(204).send();
});

export default router;
