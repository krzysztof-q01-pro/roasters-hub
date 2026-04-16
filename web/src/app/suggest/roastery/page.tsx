import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { SuggestRoasteryForm } from "./_components/SuggestRoasteryForm"

export const metadata: Metadata = {
  title: "Suggest a Roastery | Bean Map",
  description: "Know a great specialty roastery? Suggest it — we'll review and publish it.",
}

export default function SuggestRoasteryPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-[var(--color-outline)]">
            Help us grow
          </p>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-on-surface)]">
            Suggest a roastery
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            Know a great specialty roastery? Fill in what you know — the rest is
            optional.
          </p>
        </div>
        <SuggestRoasteryForm />
      </main>
      <Footer />
    </>
  )
}
