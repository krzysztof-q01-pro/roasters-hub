/**
 * Maps locale to a sensible default country for registration forms.
 * Used to pre-fill the country field based on the user's locale/domain.
 */
const LOCALE_COUNTRY_MAP: Record<string, { name: string; code: string }> = {
  pl: { name: "Poland", code: "PL" },
  de: { name: "Germany", code: "DE" },
};

export function getDefaultCountryFromLocale(
  locale: string
): { name: string; code: string } | null {
  return LOCALE_COUNTRY_MAP[locale] ?? null;
}
