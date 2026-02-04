import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

const clientSchema = z.object({
  accountId: z.number(),
  name: z.string().min(1),
  contracts: z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  sellDate: z.string().optional().nullable(),
  work: z.string().optional().nullable(),
  homeAddress: z.string().optional().nullable(),
  workAddress: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  courtStatus: z.string().optional().nullable()
});

router.get("/", requireAuth, requirePermission("clients:read"), async (req, res) => {
  const user = req.user!;
  const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
  const q = req.query.q ? String(req.query.q) : "";
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const where: Record<string, unknown> = {};
  if (!user.isAdmin) {
    where.accountId = user.accountId ?? -1;
  } else if (accountId) {
    where.accountId = accountId;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nationalId: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } }
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    take: limit,
    orderBy: { id: "desc" },
    include: { account: true, _count: { select: { attachments: true } } }
  });

  return res.json({ data: clients });
});

router.get("/:id", requireAuth, requirePermission("clients:read"), async (req, res) => {
  const user = req.user!;
  const id = Number(req.params.id);
  const client = await prisma.client.findUnique({ where: { id }, include: { account: true } });

  if (!client) {
    return res.status(404).json({ message: "Not found" });
  }

  if (!user.isAdmin && client.accountId !== user.accountId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({ data: client });
});

router.post("/", requireAuth, requirePermission("clients:write"), async (req, res) => {
  const parse = clientSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const user = req.user!;
  const data = { ...parse.data };
  if (!user.isAdmin) {
    data.accountId = user.accountId ?? data.accountId;
  }

  const client = await prisma.client.create({ data });
  return res.status(201).json({ data: client });
});

router.put("/:id", requireAuth, requirePermission("clients:write"), async (req, res) => {
  const parse = clientSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const user = req.user!;
  if (!user.isAdmin) {
    const existing = await prisma.client.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing || existing.accountId !== user.accountId) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const client = await prisma.client.update({
    where: { id: Number(req.params.id) },
    data: parse.data
  });
  return res.json({ data: client });
});

router.delete("/:id", requireAuth, requirePermission("clients:write"), async (req, res) => {
  const user = req.user!;
  const id = Number(req.params.id);
  if (!user.isAdmin) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing || existing.accountId !== user.accountId) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  await prisma.client.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
