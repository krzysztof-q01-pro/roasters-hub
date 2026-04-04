import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Roastery",
  description: "List your specialty coffee roastery on Bean Map. Reach coffee enthusiasts around the world.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
