import AuthForm from "@/components/forms/AuthForm";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Log in" subtitle="Access your Gifta Guru account, addresses, orders, and wishlist." action={loginAction} mode="login" />
    </main>
  );
}
