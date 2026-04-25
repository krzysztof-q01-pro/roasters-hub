import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Cafe",
  description: "List your specialty coffee cafe on Bean Map. Connect with roasters and coffee enthusiasts.",
};

export default function RegisterCafeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
