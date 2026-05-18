import crypto from "node:crypto";

export function generateId(): string {
  return "t_" + crypto.randomBytes(3).toString("hex");
}

export function truncateId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

const MS_PER_DAY = 86_400_000;

/** Whole days elapsed since `createdAt` (ISO string). */
export function daysSinceCreated(createdAt: string, now = Date.now()): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((now - created) / MS_PER_DAY));
}

export function daysSinceCreatedColor(days: number): "gray" | "yellow" | "red" {
  if (days > 7) return "red";
  if (days > 3) return "yellow";
  return "gray";
}
