# Documentation Overview

Mapa do całej dokumentacji projektu. Znajdź właściwy dokument szybko.

---

## Orientacja Projektu (czytaj najpierw)

| Plik | Cel |
|------|-----|
| [`/PROJECT_STATUS.md`](../PROJECT_STATUS.md) | **Ground truth** — co aktualnie istnieje i działa (vs. intencja) |
| [`/ROADMAP.md`](../ROADMAP.md) | **Kanban** — co teraz, co następne, co zrobione |
| [`/CLAUDE.md`](../CLAUDE.md) | Instrukcje dla agenta AI (WAT framework) |
| [`/web/AGENTS.md`](../web/AGENTS.md) | Instrukcje orientacji agenta dla aplikacji web |

---

## Produkt

| Dokument | Zawartość |
|----------|-----------|
| [`concept.md`](concept.md) | Wizja produktu, cel, użytkownicy, model biznesowy, zakres MVP |
| [`seed-roasters.md`](seed-roasters.md) | Lista 60+ palarni do importu jako dane startowe do DB |

---

## Architektura (Decyzje Techniczne)

| Dokument | Zawartość |
|----------|-----------|
| [`architecture/technical-overview.md`](architecture/technical-overview.md) | Stack techniczny, strategia renderowania (SSG/ISR/SSR), hosting, bezpieczeństwo |
| [`architecture/api-design.md`](architecture/api-design.md) | Wzorzec Server Actions, `ActionResult<T>`, schematy Zod, obsługa błędów |
| [`architecture/project-structure.md`](architecture/project-structure.md) | Struktura katalogów, konwencje nazewnictwa, mapa routingu |
| [`architecture/database-schema.md`](architecture/database-schema.md) | Modele Prisma, diagram ER, uzasadnienie decyzji projektowych |

> ⚠️ Dokumenty architektury opisują **intencję** — nie aktualny stan kodu.
> Sprawdź `/PROJECT_STATUS.md` aby wiedzieć co faktycznie istnieje.

---

## Badania

| Dokument | Zawartość |
|----------|-----------|
| [`research/README.md`](research/README.md) | Indeks badań i metodologia |
| [`research/personas/roaster.md`](research/personas/roaster.md) | Persona: właściciel palarni |
| [`research/personas/cafe.md`](research/personas/cafe.md) | Persona: kupujący z kawiarni |
| [`research/personas/consumer.md`](research/personas/consumer.md) | Persona: konsument/home brewer |
| [`research/market/specialty-coffee-market.md`](research/market/specialty-coffee-market.md) | Rozmiar rynku, trendy, prognozy wzrostu |
| [`research/market/competitive-analysis.md`](research/market/competitive-analysis.md) | Analiza konkurencji, macierz porównawcza |
| [`research/platform/jtbd-mapping.md`](research/platform/jtbd-mapping.md) | Jobs-To-Be-Done framework |
| [`research/platform/shared-value.md`](research/platform/shared-value.md) | Alignment wartości platformy |
| [`research/platform/pricing-research.md`](research/platform/pricing-research.md) | Analiza WTP, badania cenowe |

---

## Design

| Dokument | Zawartość |
|----------|-----------|
| [`design/stitch-brief.md`](design/stitch-brief.md) | Pełna specyfikacja UI/UX dla każdego ekranu |
| [`design/hearth_roast/DESIGN.md`](design/hearth_roast/DESIGN.md) | System designu (kolory, typografia, filozofia) |
| [`design/stitch/`](design/stitch/) | Exporty z Google Stitch (HTML + screenshoty) |

---

## Narzędzia i Procesy

| Dokument | Zawartość |
|----------|-----------|
| [`/tools/README.md`](../tools/README.md) | Opis skryptów Python (WAT Layer 3) |
| [`/workflows/persona_research.md`](../workflows/persona_research.md) | SOP dla badań person |
| [`/workflows/competitive_analysis.md`](../workflows/competitive_analysis.md) | SOP dla analizy konkurencji |

---

## Archiwum

| Dokument | Powód archiwizacji |
|----------|-------------------|
| [`archive/brand_name_proposals.md`](archive/brand_name_proposals.md) | Historyczne iteracje nazw v1–v4; decyzja podjęta: "Roasters Hub" / beanmap.cafe |
