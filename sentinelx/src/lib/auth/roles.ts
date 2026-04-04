import type { Role } from "@/types/security";

export function normalizeRole(input: unknown): Role {
  const value = String(input ?? "").toLowerCase();
  if (value === "admin" || value === "analyst" || value === "viewer") return value;
  return "viewer";
}

