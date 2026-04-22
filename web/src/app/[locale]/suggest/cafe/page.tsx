import type { Metadata } from "next"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { SuggestCafeForm } from "./_components/SuggestCafeForm"

export const metadata: Metadata = {
  title: "Suggest a Cafe | Bean Map",
  description: "Know a great specialty cafe? Suggest it — we'll review and publish it.",
}

export default function SuggestCafePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-[var(--color-outline)]">
            Help us grow
          </p>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-on-surface)]">
            Suggest a cafe
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            Know a great specialty cafe? Fill in what you know — the rest is
            optional. Our team will review and publish it.
          </p>
        </div>
        <SuggestCafeForm />
      </main>
      <Footer />
    </>
  )
}
