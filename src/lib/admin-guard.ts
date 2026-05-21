import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";

export async function requireAdmin(requiredPermissions: string[] = []) {
  const session = await auth();
  if (!session?.user) redirect("/admin/giris");

  // Stale JWT (no roleId) → clear the session and show login form
  if (!session.user.roleId) redirect("/admin/giris?clear=1");

  if (requiredPermissions.length === 0) {
    return session;
  }

  const role = await prisma.role.findUnique({
    where: { id: session.user.roleId },
    select: { name: true, isSystem: true, permissions: true },
  });

  if (!role) redirect("/admin/giris");

  // System ADMIN bypasses all permission checks
  if (role.isSystem && role.name === "ADMIN") {
    return session;
  }

  const permissions = role.permissions as string[];
  const hasAll = requiredPermissions.every((p) => permissions.includes(p));
  if (!hasAll) redirect("/admin");

  return session;
}
