import type { Metadata } from "next"
import { SuggestRoasteryForm } from "./_components/SuggestRoasteryForm"

export const metadata: Metadata = {
  title: "Zaproponuj palarnię | Bean Map",
  description: "Znasz świetną palarnię specialty? Zaproponuj ją — zweryfikujemy i opublikujemy.",
}

export default function SuggestRoasteryPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">
          Pomóż nam rosnąć
        </p>
        <h1 className="mb-2 text-3xl font-bold text-gray-100">
          Zaproponuj palarnię
        </h1>
        <p className="text-gray-400">
          Znasz świetną palarnię specialty? Wypełnij tylko co wiesz — reszta
          nie jest obowiązkowa.
        </p>
      </div>
      <SuggestRoasteryForm />
    </main>
  )
}
