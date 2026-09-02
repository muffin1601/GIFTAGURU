import type { Metadata } from "next";
import AuthForm from "@/components/forms/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { safeNextPath } from "@/lib/auth/redirect";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Log In | Gifta Guru",
  description: "Log in to your Gifta Guru account to track orders and manage addresses.",
  path: "/login",
  index: false,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmed?: string }>;
}) {
  // `next` is stamped by the middleware when it bounces an unauthenticated
  // request, and by the checkout auth gate. Re-validated server-side in the
  // login action. `confirmed` is set by /auth/callback after an email
  // confirmation link is verified.
  const { next, confirmed } = await searchParams;

  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm
        title="Log in"
        subtitle="Access your Gifta Guru account, addresses, orders, and wishlist."
        action={loginAction}
        mode="login"
        next={safeNextPath(next)}
        notice={confirmed === "1" ? "Your email is confirmed. Log in to continue." : undefined}
      />
    </main>
  );
}
