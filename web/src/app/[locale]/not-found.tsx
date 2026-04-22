import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-7xl font-display font-semibold text-stone-200 mb-4">{t("notFoundCode")}</p>
        <h1 className="text-2xl font-display font-semibold text-stone-800 mb-3">
          {t("notFoundTitle")}
        </h1>
        <p className="text-stone-500 mb-8 max-w-sm">{t("notFoundDescription")}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/roasters"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            {t("browseRoasters")}
          </Link>
          <Link
            href="/cafes"
            className="rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            {t("browseCafes")}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
