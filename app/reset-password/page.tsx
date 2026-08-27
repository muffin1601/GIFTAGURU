import AuthForm from "@/components/forms/AuthForm";
import { resetPasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  return (
    <main className="bg-cream-200 py-16 sm:py-24">
      <AuthForm title="Set new password" subtitle="Choose a new password for your Gifta Guru account." action={resetPasswordAction} mode="reset" />
    </main>
  );
}
