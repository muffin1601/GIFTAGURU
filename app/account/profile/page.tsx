import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import AccountBreadcrumb from "@/components/account/AccountBreadcrumb";
import { ChangePasswordForm, ProfileDetailsForm } from "@/components/account/ProfileForms";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Profile | Gifta Guru",
  description: "Manage your Gifta Guru business profile and password.",
  path: "/account/profile",
  index: false,
});

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/profile");

  // The profile row is normally created by the handle_new_user trigger, but
  // an account predating it would have none -- render defaults rather than
  // crashing, and the first save creates it via requireProfileId().
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <AccountBreadcrumb current="Profile" />
      <h1 className="type-h1 mt-4">Profile</h1>
      <p className="type-lead mt-4">Your business details and account security.</p>

      <div className="mt-10">
        <ProfileDetailsForm
          fullName={profile?.fullName ?? ""}
          companyName={profile?.companyName ?? ""}
          phone={profile?.phone ?? ""}
          email={user.email ?? ""}
        />
        <ChangePasswordForm />
      </div>
    </Container>
  );
}
