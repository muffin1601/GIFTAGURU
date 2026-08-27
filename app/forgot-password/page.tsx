import AuthForm from "@/components/forms/AuthForm";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Reset password" subtitle="Enter your email and we will send secure reset instructions." action={forgotPasswordAction} mode="forgot" />
    </main>
  );
}
