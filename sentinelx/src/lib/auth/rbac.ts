import { type NextRequest } from "next/server";
import type { Role } from "@/types/security";

const ROLE_ORDER: Record<Role, number> = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

export function getRoleFromRequest(request: NextRequest): Role {
  const value = request.headers.get("x-sentinelx-role")?.toLowerCase();
  if (value === "admin" || value === "analyst" || value === "viewer") {
    return value;
  }
  return "viewer";
}

export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[requiredRole];
}
