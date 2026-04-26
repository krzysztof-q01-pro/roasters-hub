# Podpięcie domeny beanmap.pl — Instrukcja (HUMAN ONLY)

> **Status:** Do wykonania ręcznie przez właściciela konta Vercel / rejestratora domeny.
> **Deadline:** Przed uruchomieniem produkcyjnym (go-live).

---

## Stan obecny

- `beanmap.pl` wskazuje na serwery `dinfo.pl` (parking page)
- Produkcja działa pod `beanmap-web.vercel.app`
- W kodzie (`web/src/i18n/routing.ts`) tymczasowo usunięto konfigurację `domains` — po podpięciu domeny należy ją przywrócić

---

## Krok 1: Dodaj domenę w Vercel

1. Wejdź w [Vercel Dashboard](https://vercel.com/dashboard) → wybierz projekt `beanmap-web`
2. **Settings → Domains**
3. Kliknij **Add Domain**
4. Wpisz: `beanmap.pl`
5. Kliknij **Add**

Vercel wyświetli rekordy DNS do skonfigurowania u rejestratora.

---

## Krok 2: Skonfiguruj DNS u rejestratora (dinfo.pl)

Zaloguj się do panelu rejestratora `dinfo.pl` i ustaw jeden z poniższych wariantów:

### Wariant A: A Record (zalecany dla root domain)

| Typ | Nazwa | Wartość |
|-----|-------|---------|
| A | `@` | `76.76.21.21` |

### Wariant B: CNAME (jeśli rejestrator nie pozwala na A record dla `@`)

| Typ | Nazwa | Wartość |
|-----|-------|---------|
| CNAME | `@` | `cname.vercel-dns.com` |

> ⚠️ **Uwaga:** Niektórzy rejestratorzy nie pozwalają na CNAME dla root domain. Wtedy użyj A record.

---

## Krok 3: Przekierowanie www → root (opcjonalne, ale zalecane)

Aby `www.beanmap.pl` przekierowywało na `beanmap.pl`:

1. W Vercel Dashboard → Domains → `beanmap.pl` → **Edit**
2. Włącz **Redirect www.beanmap.pl to beanmap.pl**

Lub ręcznie w DNS:

| Typ | Nazwa | Wartość |
|-----|-------|---------|
| CNAME | `www` | `cname.vercel-dns.com` |

---

## Krok 4: Przywróć konfigurację `domains` w kodzie

Po potwierdzeniu że domena działa (SSL zielone, strona się ładuje):

Edytuj `web/src/i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  domains: [
    { domain: "beanmap.cafe", defaultLocale: "en", locales: ["en", "pl", "de"] },
    { domain: "beanmap.pl", defaultLocale: "pl", locales: ["pl", "en"] },
    { domain: "beanmap.de", defaultLocale: "de", locales: ["de", "en"] },
    { domain: "localhost", defaultLocale: "en", locales: ["en", "pl", "de"] },
    { domain: "beanmap-web.vercel.app", defaultLocale: "en", locales: ["en", "pl", "de"] },
  ],
});
```

Zacommituj i wypchnij na main.

---

## Krok 5: Zaktualizuj zmienne środowiskowe w Vercel

1. Vercel Dashboard → Project Settings → Environment Variables
2. Zaktualizuj:
   - `NEXT_PUBLIC_APP_URL` → `https://beanmap.pl`
3. Jeśli masz inne zmienne z URL, zaktualizuj je również.

---

## Krok 6: Weryfikacja

Po propagacji DNS (do 24h, zazwyczaj 5-15 min):

```bash
curl -sI https://beanmap.pl
# Oczekiwany wynik: HTTP/2 200

curl -s https://beanmap.pl | grep -o "Odkryj kawę specialty\|Discover specialty coffee"
# Oczekiwany wynik: tytuł strony głównej w odpowiednim języku
```

Sprawdź też:
- [ ] `https://beanmap.pl/pl` → 200 (język polski)
- [ ] `https://beanmap.pl/privacy` → 200 (Polityka Prywatności po polsku)
- [ ] `https://beanmap.pl/terms` → 200 (Regulamin po polsku)
- [ ] `https://beanmap.pl/cookies` → 200 (Polityka Cookies)
- [ ] Certyfikat SSL jest ważny (zielona kłódka)

---

## Krok 7: Uzupełnij dane w Polityce Prywatności i Regulaminie

W plikach `web/src/app/[locale]/(legal)/privacy/page.tsx` i `terms/page.tsx` uzupełnij:

- `[adres do uzupełnienia]` → faktyczny adres siedziby
- `[NIP do uzupełnienia]` / `[VAT to be completed]` → NIP firmy
- `[REGON do uzupełnienia]` → REGON (jeśli dotyczy)
- `[imię i nazwisko do uzupełnienia]` → Inspektor Ochrony Danych (jeśli wyznaczony)

---

## Troubleshooting

### "Domain already in use"
Jeśli Vercel wyświetla błąd że domena jest już używana — sprawdź czy nie jest podpięta pod inny projekt Vercel.

### "DNS propagation pending"
Poczekaj 15-30 min i odśwież. Jeśli po 24h nadal nie działa — sprawdź czy rekordy DNS są poprawne u rejestratora.

### Strona wyświetla się po angielsku zamiast po polsku
To oznacza że konfiguracja `domains` w `routing.ts` nie została jeszcze przywrócona. Wróć do Kroku 4.

---

*Dokument przygotowany: 2026-04-26*
