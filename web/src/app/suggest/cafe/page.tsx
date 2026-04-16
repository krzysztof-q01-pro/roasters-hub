import type { Metadata } from "next"
import { SuggestCafeForm } from "./_components/SuggestCafeForm"

export const metadata: Metadata = {
  title: "Zaproponuj kawiarnię | Bean Map",
  description: "Znasz świetną kawiarnię specialty? Zaproponuj ją — zweryfikujemy i opublikujemy.",
}

export default function SuggestCafePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">
          Pomóż nam rosnąć
        </p>
        <h1 className="mb-2 text-3xl font-bold text-gray-100">
          Zaproponuj kawiarnię
        </h1>
        <p className="text-gray-400">
          Znasz świetne miejsce? Wypełnij tylko co wiesz — reszta nie jest
          obowiązkowa. Nasz team zweryfikuje i opublikuje.
        </p>
      </div>
      <SuggestCafeForm />
    </main>
  )
}
