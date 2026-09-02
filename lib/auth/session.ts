import "server-only";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Identity for customer-owned server actions.
 *
 * The user id is ALWAYS derived from the session cookie, never accepted as a
 * parameter -- that is what stops one customer addressing another's addresses,
 * wishlist or orders.
 */

export class NotAuthenticatedError extends Error {
  constructor() {
    super("You need to be signed in to do that.");
    this.name = "NotAuthenticatedError";
  }
}

export async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new NotAuthenticatedError();
  return user;
}

/**
 * Returns the profile id for the signed-in customer, creating the row if the
 * database trigger that normally does so (handle_new_user, migration 0001)
 * didn't fire -- for instance on accounts created before it existed, or via
 * the admin API. Address and wishlist rows are FK-bound to profiles, so a
 * missing profile would otherwise surface as a foreign-key error.
 */
export async function requireProfileId(): Promise<string> {
  const user = await requireSessionUser();

  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    },
  });

  return user.id;
}
