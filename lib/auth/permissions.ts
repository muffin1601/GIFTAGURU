/**
 * Capability map for the admin panel.
 *
 * Call sites ask for a capability ("products.bulk"), never for a role, so new
 * roles (product manager, SEO manager, sales, viewer) only need an entry here.
 * Pure module: safe to import from client components to hide controls, but the
 * real boundary is `requirePermission` in lib/auth/admin.ts, which every
 * mutating server action calls.
 */
export const PERMISSIONS = [
  "products.view",
  "products.edit",
  "products.bulk",
  "products.delete",
  "products.export",
  "products.import",
  "seo.edit",
  "enquiries.manage",
  "content.manage",
  "users.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type AdminRole = "admin" | "super_admin";

const ALL = new Set<Permission>(PERMISSIONS);

const ROLE_PERMISSIONS: Record<AdminRole, ReadonlySet<Permission>> = {
  super_admin: ALL,
  // Admins run the catalogue day to day but cannot hard-delete products or
  // change who has admin access.
  admin: new Set(PERMISSIONS.filter((permission) => permission !== "products.delete" && permission !== "users.manage")),
};

export function roleCan(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function permissionsFor(role: AdminRole): Permission[] {
  return PERMISSIONS.filter((permission) => roleCan(role, permission));
}
