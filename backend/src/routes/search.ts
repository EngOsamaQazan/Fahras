import { Router } from "express";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

function normalizeQuery(query: string) {
  const trimmed = query.trim();
  if (/^0\d{9}$/.test(trimmed)) {
    return trimmed.slice(1);
  }
  return trimmed;
}

function normalizeRemoteQuery(query: string) {
  return query.replace(/\s+/g, "%");
}

function isNumericQuery(query: string) {
  return /^[0-9]+$/.test(query);
}

type RemoteSource = {
  name: string;
  urlTemplate: string;
  headers?: Record<string, string>;
  mapping?: Record<string, string>;
};

async function fetchRemote(source: RemoteSource, query: string) {
  if (!source.urlTemplate) {
    return null;
  }

  const url = source.urlTemplate.replace("{{query}}", encodeURIComponent(query));
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "fahras-modern", ...(source.headers ?? {}) }
    });
    clearTimeout(timeout);

    const text = await response.text();
    if (!response.ok) {
      return { label: source.name, error: `HTTP ${response.status}` };
    }
    if (!text || text.trim() === "") {
      return { label: source.name, error: "Empty response" };
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(text);
    } catch (error) {
      return { label: source.name, error: `Invalid JSON: ${text.slice(0, 200)}` };
    }

    const rawData = Array.isArray((decoded as any)?.data) ? (decoded as any).data : decoded;
    if (Array.isArray(rawData)) {
      return { label: source.name, data: rawData };
    }
    if (rawData && typeof rawData === "object") {
      return { label: source.name, data: Object.values(rawData as Record<string, unknown>) };
    }
    return { label: source.name, data: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remote request failed";
    return { label: source.name, error: message };
  }
}

function mapRemoteRow(
  row: Record<string, unknown>,
  mapping: Record<string, string> | undefined,
  sourceName: string
) {
  if (!mapping || Object.keys(mapping).length === 0) {
    return row;
  }

  const result: Record<string, unknown> = { sourceLabel: sourceName };
  for (const [targetKey, sourceKey] of Object.entries(mapping)) {
    result[targetKey] = row[sourceKey];
  }
  return result;
}

async function loadExternalSources() {
  const sources = await prisma.externalSource.findMany({
    where: { enabled: true },
    orderBy: { id: "asc" }
  });

  if (sources.length > 0) {
    return sources.map((source) => ({
      name: source.name,
      urlTemplate: source.urlTemplate,
      headers: (source.headers as Record<string, string>) ?? {},
      mapping: (source.mapping as Record<string, string>) ?? {}
    }));
  }

  return [
    { name: "زجل", urlTemplate: config.remoteSources.zajal },
    { name: "جدل", urlTemplate: config.remoteSources.jadal },
    { name: "نماء", urlTemplate: config.remoteSources.namaa },
    { name: "بسيل", urlTemplate: config.remoteSources.bseel }
  ].filter((source) => source.urlTemplate);
}

router.get("/", requireAuth, requirePermission("clients:read"), async (req, res) => {
  const rawQuery = String(req.query.q ?? "");
  const includeRemote = String(req.query.includeRemote ?? "true") === "true";
  const query = normalizeQuery(rawQuery);
  const remoteQuery = normalizeRemoteQuery(query);
  const user = req.user!;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  if (!query) {
    return res.json({ data: [], remote: [], errors: [] });
  }

  const numeric = isNumericQuery(query);
  const where: Record<string, unknown> = {
    OR: numeric
      ? [
          { nationalId: { equals: query } },
          { phone: { equals: query } },
          { nationalId: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } }
        ]
      : [
          { name: { contains: query, mode: "insensitive" } },
          { nationalId: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } }
        ]
  };

  if (!user.isAdmin) {
    where.accountId = user.accountId ?? -1;
  }

  const local = await prisma.client.findMany({
    where,
    take: limit,
    include: {
      account: true,
      _count: { select: { attachments: true } }
    },
    orderBy: { id: "desc" }
  });

  if (!includeRemote) {
    return res.json({ data: local, remote: [], errors: [] });
  }

  const sources = await loadExternalSources();
  const remoteResults = await Promise.all(
    sources.map((source) => fetchRemote(source, remoteQuery))
  );

  const remote = remoteResults
    .filter((item) => item && "data" in item)
    .map((item, index) => {
      const source = sources[index];
      return {
        ...item,
        data: (item as any).data?.map((row: Record<string, unknown>) =>
          mapRemoteRow(row, source.mapping, source.name)
        )
      };
    });

  const errors = remoteResults.filter((item) => item && "error" in item);

  return res.json({
    data: local,
    remote,
    errors
  });
});

export default router;
