import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

const translationSchema = z.object({
  text: z.string().min(1),
  en: z.string().optional().nullable(),
  ar: z.string().optional().nullable()
});

router.get("/", requireAuth, requirePermission("translations:read"), async (req, res) => {
  const q = req.query.q ? String(req.query.q) : "";
  const data = await prisma.translation.findMany({
    where: q
      ? {
          OR: [
            { text: { contains: q, mode: "insensitive" } },
            { en: { contains: q, mode: "insensitive" } },
            { ar: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { id: "asc" }
  });

  return res.json({ data });
});

router.post("/", requireAuth, requirePermission("translations:write"), async (req, res) => {
  const parse = translationSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const created = await prisma.translation.create({ data: parse.data });
  return res.status(201).json({ data: created });
});

router.put("/:id", requireAuth, requirePermission("translations:write"), async (req, res) => {
  const parse = translationSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const updated = await prisma.translation.update({
    where: { id: Number(req.params.id) },
    data: parse.data
  });
  return res.json({ data: updated });
});

export default router;
