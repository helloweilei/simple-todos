import crypto from "node:crypto";

export function generateId(): string {
  return "t_" + crypto.randomBytes(3).toString("hex");
}

export function truncateId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}
