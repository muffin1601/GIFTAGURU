import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="account-experience">{children}</div>;
}
