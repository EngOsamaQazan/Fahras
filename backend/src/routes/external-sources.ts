import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const mappingSchema = z.record(z.string(), z.string());

const sourceSchema = z.object({
  name: z.string().min(1),
  urlTemplate: z.string().min(1),
  enabled: z.boolean().default(true),
  mapping: mappingSchema.default({}),
  headers: z.record(z.string(), z.string()).default({})
});

router.get("/", requireAuth, async (_req, res) => {
  const sources = await prisma.externalSource.findMany({ orderBy: { id: "asc" } });
  return res.json({ data: sources });
});

router.post("/", requireAuth, async (req, res) => {
  const parse = sourceSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const created = await prisma.externalSource.create({
    data: parse.data
  });

  return res.status(201).json({ data: created });
});

router.put("/:id", requireAuth, async (req, res) => {
  const parse = sourceSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const updated = await prisma.externalSource.update({
    where: { id: Number(req.params.id) },
    data: parse.data
  });

  return res.json({ data: updated });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await prisma.externalSource.delete({ where: { id: Number(req.params.id) } });
  return res.status(204).send();
});

export default router;
