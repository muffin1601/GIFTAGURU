import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, Heart, UserRound } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { logoutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Container className="py-16">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-navy-950/5">
          <h1 className="font-display text-3xl text-navy-950">Account setup pending</h1>
          <p className="mt-3 text-ink-700">Add Supabase environment variables from `.env.example` to enable secure customer accounts.</p>
          <Button href="/login" className="mt-6">Go to Login</Button>
        </div>
      </Container>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Account</p>
          <h1 className="mt-3 font-display text-4xl text-navy-950">Welcome back</h1>
          <p className="mt-2 text-ink-700">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-navy-950 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-navy-950 hover:text-cream-100">
            Log out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/account/orders", title: "Orders", copy: "Track corporate orders and payment status.", Icon: Package },
          { href: "/account/addresses", title: "Addresses", copy: "Manage billing and delivery addresses.", Icon: MapPin },
          { href: "/account/wishlist", title: "Wishlist", copy: "Saved gift sets for future campaigns.", Icon: Heart },
          { href: "/account", title: "Profile", copy: "Business profile and account preferences.", Icon: UserRound },
        ].map(({ href, title, copy, Icon }) => (
          <Link key={title} href={href} className="rounded-2xl bg-white p-6 ring-1 ring-navy-950/5 transition-shadow hover:shadow-lg">
            <Icon className="h-5 w-5 text-gold-600" />
            <h2 className="mt-4 font-display text-xl text-navy-950">{title}</h2>
            <p className="mt-2 text-sm text-ink-700">{copy}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
