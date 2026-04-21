import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}
