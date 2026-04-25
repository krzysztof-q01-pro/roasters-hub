"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-stone-900 w-full pt-12 pb-6 text-stone-400 text-sm font-light mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto mb-8">
        <div className="md:col-span-1">
          <div className="mb-2">
            <Image
              src="/brand/beanmap-logo.png"
              alt="Bean Map"
              width={102}
              height={40}
              className="h-9 w-auto brightness-0 invert"
            />
          </div>
          <p className="leading-relaxed text-[13px]">{t("tagline")}</p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-[14px] text-[10px] uppercase tracking-[0.2em]">
            {t("exploreTitle")}
          </h4>
          <ul className="space-y-4">
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/roasters">
                {t("browseRoasters")}
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/cafes">
                {t("browseCafes")}
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/map">
                {t("interactiveMap")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-[14px] text-[10px] uppercase tracking-[0.2em]">
            {t("quickLinksTitle")}
          </h4>
          <ul className="space-y-4">
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/register">
                {t("registerRoastery")}
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/roasters">
                {t("allRoasters")}
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/cafes">
                {t("allCafes")}
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/map">
                {t("map")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-[14px] text-[10px] uppercase tracking-[0.2em]">
            {t("joinUsTitle")}
          </h4>
          <p className="mb-4">{t("roasterCTA")}</p>
          <Link
            className="text-orange-500 font-semibold hover:text-white transition-colors flex items-center gap-2"
            href="/register"
          >
            {t("listRoastery")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
          <p className="mt-4 mb-2">{t("cafeCTA")}</p>
          <Link
            className="text-orange-500 font-semibold hover:text-white transition-colors flex items-center gap-2"
            href="/register/cafe"
          >
            {t("listCafe")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <Link
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors block"
              href="/suggest/roastery"
            >
              {t("suggestRoastery")}
            </Link>
            <Link
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors block"
              href="/suggest/cafe"
            >
              {t("suggestCafe")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-4 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-light" style={{color: "rgba(168,162,158,0.4)"}}>
          &copy; {new Date().getFullYear()} Bean Map. {t("crafted")}
          <span className="ml-2">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </p>
        <nav className="flex gap-4 text-[11px]" style={{color: "rgba(168,162,158,0.5)"}}>
          <Link href="/privacy" className="hover:text-stone-300 transition-colors">{t("privacyPolicy")}</Link>
          <Link href="/terms" className="hover:text-stone-300 transition-colors">{t("termsOfService")}</Link>
          <Link href="/cookies" className="hover:text-stone-300 transition-colors">{t("cookiePolicy")}</Link>
        </nav>
      </div>
    </footer>
  );
}
