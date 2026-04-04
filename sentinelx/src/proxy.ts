import { NextResponse, type NextRequest } from "next/server";
import { hasRoleAccess } from "@/lib/auth/rbac";
import { createProxyClient } from "@/lib/supabase/proxy";
import { normalizeRole } from "@/lib/auth/roles";

const roleRoutes = [
  { prefix: "/settings", role: "admin" as const },
  { prefix: "/incidents", role: "analyst" as const },
  { prefix: "/alerts", role: "analyst" as const },
];

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  // Protect all SOC pages by default (and enforce RBAC for specific routes).
  const protectingSoc =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/logs") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/incidents") ||
    pathname.startsWith("/intel") ||
    pathname.startsWith("/soar") ||
    pathname.startsWith("/settings");

  if (!protectingSoc) return NextResponse.next();

  const response = NextResponse.next();
  const supabase = createProxyClient(request, response);
  if (!supabase) {
    // Supabase not configured (dev-mode). Allow access so the app can run locally.
    return response;
  }
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role resolution: prefer org membership role; fall back to user metadata role.
  const orgId = process.env.DEFAULT_ORGANIZATION_ID;
  let role = normalizeRole(data.user.user_metadata?.role);

  if (orgId) {
    const membership = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!membership.error && membership.data?.role) {
      role = normalizeRole(membership.data.role);
    }
  }

  const match = roleRoutes.find((route) => pathname.startsWith(route.prefix));
  if (match && !hasRoleAccess(role, match.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
