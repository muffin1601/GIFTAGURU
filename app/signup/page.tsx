import AuthForm from "@/components/forms/AuthForm";
import { signupAction } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Create account" subtitle="Create a business gifting account for faster checkout and quotes." action={signupAction} mode="signup" />
    </main>
  );
}
