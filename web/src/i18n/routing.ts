import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// NOTE: When beanmap.pl / beanmap.de domains are connected to Vercel,
// restore domain-specific defaults:
// domains: [
//   { domain: "beanmap.cafe", defaultLocale: "en", locales: ["en", "pl", "de"] },
//   { domain: "beanmap.pl", defaultLocale: "pl", locales: ["pl", "en"] },
//   { domain: "beanmap.de", defaultLocale: "de", locales: ["de", "en"] },
//   { domain: "localhost", defaultLocale: "en", locales: ["en", "pl", "de"] },
//   { domain: "beanmap-web.vercel.app", defaultLocale: "en", locales: ["en", "pl", "de"] },
// ],
