import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { SuggestRoasteryForm } from "./_components/SuggestRoasteryForm"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "suggest" })
  return {
    title: t("pageRoasteryTitle"),
    description: t("pageRoasteryDescription"),
  }
}

export default async function SuggestRoasteryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "suggest" })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-[var(--color-outline)]">
            {t("helpUsGrow")}
          </p>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-on-surface)]">
            {t("suggestRoasteryHeading")}
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            {t("suggestRoasteryIntro")}
          </p>
        </div>
        <SuggestRoasteryForm />
      </main>
      <Footer />
    </>
  )
}
