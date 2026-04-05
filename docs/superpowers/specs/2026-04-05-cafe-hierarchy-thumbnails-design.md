---
title: Cafe Hierarchy & Map Thumbnails
date: 2026-04-05
author: "@MN"
status: approved
---

## Problem

1. Miniaturki kafejek na mapie wyświetlają placeholder (smiley) zamiast zdjęć — `logoUrl` jest puste,
   `coverImageUrl` nie jest używany jako fallback.
2. Kafejki nie mają hierarchii URL analogicznej do palarni. Brak stron krajowych i miejskich
   utrudnia nawigację i SEO dla zapytań geograficznych.

## Rozwiązanie

### Fix 1: Miniaturki na mapie
- Query w `map/page.tsx` dodaje `coverImageUrl` do select
- `CafeMapCard` używa `logoUrl ?? coverImageUrl` jako src

### Fix 2: Dwupoziomowa hierarchia
Nowe trasy:
- `/cafes/country/[country]` — lista kafejek w kraju + sekcja miast (country = countryCode, np. "DE")
- `/cafes/country/[country]/city/[city]` — lista kafejek w mieście (city = slug, np. "munich")

Slugifikacja miast: `city.toLowerCase().replace(/\s+/g, '-')`.
Odwrócenie w query: `{ city: { equals: slug.replace(/-/g, ' '), mode: "insensitive" } }`.

Zaktualizowane okruszki na `/cafes/[slug]`:
`HOME › CAFES › COUNTRY › CITY › CAFE_NAME`

### Reużyte komponenty
- `CafeCard` (`web/src/components/cafes/CafeCard.tsx`) — bez zmian
- Wzorzec `generateStaticParams` z `web/src/app/roasters/country/[country]/page.tsx`
- Styl breadcrumbów z `web/src/app/cafes/[slug]/page.tsx`

## Poza zakresem
- Strony regionalne (np. Bavaria)
- Filtrowanie po usługach na stronach country/city
- Zmiany w schemacie Prisma
