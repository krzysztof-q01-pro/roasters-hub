# Data Consistency + Public Proposal Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify Cafe/Roaster field coverage across all touchpoints, build a public accordion "suggest a place" form, upgrade admin panel to sidebar-based master editor, and add a shared OpeningHoursPicker component.

**Architecture:** Evolves existing Cafe/Roaster models — proposals create PENDING records with no `ownerId`, feeding the existing admin review queue. A shared `OpeningHoursPicker` component is built first and reused in both public forms and admin panel. Admin panel is restructured as a sidebar + section layout giving access to every schema field.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma + Neon PostgreSQL, Zod, Tailwind CSS v4, TypeScript, Vitest

**Spec:** `docs/superpowers/specs/2026-04-15-cafe-roastery-data-consistency-design.md`

**Natural PR split points:**
- After Task 2 → PR A: Foundation (schema + picker)
- After Task 5 → PR B: Proposal forms
- After Task 8 → PR C: Admin master editor + navigation

**Branch:** `feat/mn-data-consistency-proposal-flow`

**UX skills required during implementation:**
- Tasks 4, 5 (suggest forms): invoke `/frontend-design`, `/form-cro`, `/tailwind-patterns` before building UI
- Tasks 6, 7 (admin editors): invoke `/frontend-design`, `/tailwind-patterns` before building UI

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `web/prisma/schema.prisma` | Modify | Cafe.openingHours String→Json |
| `web/src/types/cafe-services.ts` | **Delete** | Duplicate of constants/cafe-services.ts |
| `web/src/types/opening-hours.ts` | Create | OpeningHours type + helpers |
| `web/src/components/shared/OpeningHoursPicker.tsx` | Create | Shared day/time picker component |
| `web/src/types/actions.ts` | Modify | Add ProposeCafeSchema, ProposeRoasterSchema |
| `web/src/actions/cafe.actions.ts` | Modify | Add createCafeProposal, extend adminUpdateCafe |
| `web/src/actions/roaster.actions.ts` | Modify | Add createRoasterProposal |
| `web/src/actions/admin.actions.ts` | Modify | Extend adminUpdateRoaster with all fields |
| `web/src/actions/cafe.actions.test.ts` | Modify | Add createCafeProposal tests |
| `web/src/actions/roaster.actions.test.ts` | Modify | Add createRoasterProposal tests |
| `web/src/app/suggest/cafe/page.tsx` | Create | /suggest/cafe route (server shell + metadata) |
| `web/src/app/suggest/cafe/_components/SuggestCafeForm.tsx` | Create | Accordion form client component |
| `web/src/app/suggest/roastery/page.tsx` | Create | /suggest/roastery route |
| `web/src/app/suggest/roastery/_components/SuggestRoasteryForm.tsx` | Create | Accordion form client component |
| `web/src/app/admin/cafes/[id]/client.tsx` | Rewrite | Sidebar master editor (7 sections) |
| `web/src/app/admin/cafes/[id]/_sections/IdentitySection.tsx` | Create | Name, slug, city, country, description, priceRange, seatingCapacity |
| `web/src/app/admin/cafes/[id]/_sections/LocationSection.tsx` | Create | address, postalCode, lat, lng, sourceUrl |
| `web/src/app/admin/cafes/[id]/_sections/ContactSection.tsx` | Create | website, instagram, phone, email |
| `web/src/app/admin/cafes/[id]/_sections/HoursSection.tsx` | Create | OpeningHoursPicker wrapper |
| `web/src/app/admin/cafes/[id]/_sections/ServicesSection.tsx` | Create | serving (tags), services (checkboxes) |
| `web/src/app/admin/cafes/[id]/_sections/ImagesSection.tsx` | Create | coverImageUrl, logoUrl uploads |
| `web/src/app/admin/cafes/[id]/_sections/AdminSection.tsx` | Create | status, featured, featuredUntil, rejectedReason, ownerId |
| `web/src/app/admin/roasters/[id]/client.tsx` | Rewrite | Sidebar master editor (8 sections) |
| `web/src/app/admin/roasters/[id]/_sections/` | Create | 8 section components (mirrors cafe pattern) |
| `web/src/components/shared/Header.tsx` | Modify | Dropdown CTA "Zaproponuj / Mam palarnię" |
| `web/src/components/shared/Footer.tsx` | Modify | Add /suggest links |
| `web/src/app/cafes/page.tsx` | Modify | "Brakuje kawiarni?" banner |
| `web/src/app/roasters/page.tsx` | Modify | "Nie ma tu Twojej palarni?" banner |

---

## Task 1: Schema migration — Cafe.openingHours String→Json + cleanup

**Files:**
- Modify: `web/prisma/schema.prisma`
- Delete: `web/src/types/cafe-services.ts`

- [ ] **Step 1.1: Edit schema**

In `web/prisma/schema.prisma`, find the Cafe model and change:
```prisma
// Before
openingHours  String?

// After
openingHours  Json?
```

- [ ] **Step 1.2: Run migration**

```bash
cd web && npx prisma migrate dev --name cafe_opening_hours_json
```

Expected output: `✔ Generated Prisma Client` and a new migration file in `web/prisma/migrations/`.

- [ ] **Step 1.3: Verify migration succeeded**

```bash
npx prisma studio
```

Open Cafe table in browser — confirm `openingHours` column is now `jsonb` type. Then close Prisma Studio.

- [ ] **Step 1.4: Check for imports of the duplicate file**

```bash
cd /workspaces/roasters-hub && grep -r "from.*types/cafe-services" web/src/
```

Expected: no output (file is unused). If any imports appear, update them to import from `@/constants/cafe-services` instead.

- [ ] **Step 1.5: Delete duplicate file**

```bash
rm web/src/types/cafe-services.ts
```

- [ ] **Step 1.6: Validate**

```bash
cd web && npx tsc --noEmit && npx eslint src --ext .ts,.tsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 1.7: Commit**

```bash
git checkout -b feat/mn-data-consistency-proposal-flow
git add web/prisma/schema.prisma web/prisma/migrations/ web/src/types/
git commit -m "DB: migrate Cafe.openingHours String→Json, remove duplicate cafe-services type"
```

---

## Task 2: OpeningHours types + OpeningHoursPicker component

**Files:**
- Create: `web/src/types/opening-hours.ts`
- Create: `web/src/components/shared/OpeningHoursPicker.tsx`

- [ ] **Step 2.1: Create types file**

Create `web/src/types/opening-hours.ts`:

```typescript
export type DayHours = { open: string; close: string } | null

export type OpeningHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const
export const ALL_DAYS = [
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
] as const
export type Day = (typeof ALL_DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mon: "Pon",
  tue: "Wt",
  wed: "Śr",
  thu: "Czw",
  fri: "Pt",
  sat: "Sob",
  sun: "Nd",
}

export const EMPTY_OPENING_HOURS: OpeningHours = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
}

/** 06:00 to 23:45 in 15-minute increments */
export function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 23 && m > 45) break
      times.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      )
    }
  }
  return times
}

export const TIME_OPTIONS = generateTimeOptions()
```

- [ ] **Step 2.2: Create OpeningHoursPicker component**

Create `web/src/components/shared/OpeningHoursPicker.tsx`:

```typescript
"use client"

import { ALL_DAYS, DAY_LABELS, OpeningHours, TIME_OPTIONS, WEEKDAYS, Day } from "@/types/opening-hours"

interface Props {
  value: OpeningHours
  onChange: (value: OpeningHours) => void
}

const DEFAULT_OPEN = "08:00"
const DEFAULT_CLOSE = "18:00"

export function OpeningHoursPicker({ value, onChange }: Props) {
  function handleToggle(day: Day, checked: boolean) {
    if (checked) {
      const hours = { open: DEFAULT_OPEN, close: DEFAULT_CLOSE }
      const next = { ...value, [day]: hours }
      // Smart Monday: toggling Mon open propagates to Tue-Fri
      if (day === "mon") {
        WEEKDAYS.forEach((d) => {
          if (d !== "mon") next[d] = { ...hours }
        })
      }
      onChange(next)
    } else {
      onChange({ ...value, [day]: null })
    }
  }

  function handleTimeChange(
    day: Day,
    field: "open" | "close",
    time: string
  ) {
    const existing = value[day]
    if (!existing) return
    onChange({ ...value, [day]: { ...existing, [field]: time } })
  }

  function copyMonToWeekdays() {
    const monHours = value.mon
    if (!monHours) return
    const next = { ...value }
    WEEKDAYS.forEach((d) => {
      if (d !== "mon") next[d] = { ...monHours }
    })
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      {ALL_DAYS.map((day) => {
        const hours = value[day]
        const isOpen = hours !== null
        return (
          <div
            key={day}
            className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
              isOpen ? "bg-white/5" : "bg-transparent opacity-50"
            }`}
          >
            <input
              type="checkbox"
              id={`day-${day}`}
              checked={isOpen}
              onChange={(e) => handleToggle(day, e.target.checked)}
              className="accent-[var(--color-accent)] h-4 w-4 cursor-pointer"
            />
            <label
              htmlFor={`day-${day}`}
              className="w-8 cursor-pointer select-none text-sm font-medium text-gray-300"
            >
              {DAY_LABELS[day]}
            </label>

            {isOpen ? (
              <>
                <select
                  value={hours.open}
                  onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                  className="rounded bg-white/10 px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-gray-500">—</span>
                <select
                  value={hours.close}
                  onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                  className="rounded bg-white/10 px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </>
            ) : (
              <span className="text-sm italic text-gray-600">zamknięte</span>
            )}
          </div>
        )
      })}

      {value.mon !== null && (
        <button
          type="button"
          onClick={copyMonToWeekdays}
          className="mt-1 self-start rounded px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Kopiuj Pon–Pt do wszystkich dni roboczych
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2.3: Validate**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.4: Commit**

```bash
git add web/src/types/opening-hours.ts web/src/components/shared/OpeningHoursPicker.tsx
git commit -m "UI: add OpeningHours types + OpeningHoursPicker component (Smart Monday)"
```

---

## Task 3: Proposal Zod schemas + server actions

**Files:**
- Modify: `web/src/types/actions.ts`
- Modify: `web/src/actions/cafe.actions.ts`
- Modify: `web/src/actions/roaster.actions.ts`
- Modify: `web/src/actions/cafe.actions.test.ts`
- Modify: `web/src/actions/roaster.actions.test.ts`

- [ ] **Step 3.1: Write failing test for createCafeProposal**

Add to `web/src/actions/cafe.actions.test.ts` (after the existing imports/mocks — `createCafeProposal` doesn't exist yet):

```typescript
import { createCafe, verifyCafe, rejectCafe, adminUpdateCafe, createCafeProposal } from "@/actions/cafe.actions"

// ... (existing tests remain unchanged) ...

describe("createCafeProposal", () => {
  it("creates PENDING cafe with no ownerId and returns slug", async () => {
    mockCreate.mockResolvedValue({ slug: "brew-lab" })

    const fd = makeFormData({
      name: "Brew Lab",
      city: "Warsaw",
      country: "Poland",
    })
    const result = await createCafeProposal(fd)

    expect(result).toEqual({ data: { slug: "brew-lab" } })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          ownerId: undefined,
          name: "Brew Lab",
        }),
      })
    )
  })

  it("returns fieldError when name is too short", async () => {
    const fd = makeFormData({ name: "X", city: "Warsaw", country: "Poland" })
    const result = await createCafeProposal(fd)
    expect(result).toHaveProperty("fieldErrors.name")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("stores parsed openingHours JSON", async () => {
    mockCreate.mockResolvedValue({ slug: "test" })
    const hours = JSON.stringify({ mon: { open: "08:00", close: "18:00" }, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null })
    const fd = makeFormData({ name: "Test Cafe", city: "Warsaw", country: "Poland", openingHours: hours })
    await createCafeProposal(fd)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          openingHours: { mon: { open: "08:00", close: "18:00" }, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
        }),
      })
    )
  })
})
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
cd web && npx vitest run src/actions/cafe.actions.test.ts
```

Expected: FAIL — `createCafeProposal is not a function`.

- [ ] **Step 3.3: Add ProposeCafeSchema and ProposeRoasterSchema to types/actions.ts**

Add to `web/src/types/actions.ts` (after existing schemas):

```typescript
export const ProposeCafeSchema = z.object({
  name: z.string().min(2, "Minimum 2 znaki").max(100),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(60),
  address: z.string().max(200).optional().or(z.literal("")),
  website: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  instagram: z.string().max(50).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Nieprawidłowy email").optional().or(z.literal("")),
  description: z.string().max(500, "Maksymalnie 500 znaków").optional().or(z.literal("")),
  openingHours: z.string().optional().or(z.literal("")), // JSON string, parsed in action
  services: z.string().optional().or(z.literal("")), // comma-separated values
})

export const ProposeRoasterSchema = z.object({
  name: z.string().min(2, "Minimum 2 znaki").max(100),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(60),
  website: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  instagram: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("Nieprawidłowy email").optional().or(z.literal("")),
  shopUrl: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  description: z.string().max(500, "Maksymalnie 500 znaków").optional().or(z.literal("")),
  certifications: z.array(z.string()).max(10).optional().default([]),
  origins: z.array(z.string()).optional().default([]),
  roastStyles: z.array(z.string()).max(5).optional().default([]),
  openingHours: z.string().optional().or(z.literal("")),
})
```

- [ ] **Step 3.4: Implement createCafeProposal in cafe.actions.ts**

Add to `web/src/actions/cafe.actions.ts`:

```typescript
import { ProposeCafeSchema } from "@/types/actions"
import type { Prisma } from "@prisma/client"

export async function createCafeProposal(
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  const raw = Object.fromEntries(formData)
  const parsed = ProposeCafeSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { name, city, country, address, website, instagram, phone, email,
    description, openingHours: hoursRaw, services: servicesRaw } = parsed.data

  const countryCode = resolveCountryCode(country)
  const slug = await generateUniqueCafeSlug(name, city)

  let openingHours: Prisma.InputJsonValue | undefined = undefined
  if (hoursRaw) {
    try { openingHours = JSON.parse(hoursRaw) } catch { /* invalid JSON, skip */ }
  }

  const services = servicesRaw
    ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  await db.cafe.create({
    data: {
      name,
      city,
      country,
      countryCode,
      slug,
      status: "PENDING",
      address: address || null,
      website: website || null,
      instagram: instagram || null,
      phone: phone || null,
      email: email || null,
      description: description || null,
      openingHours,
      services,
    },
  })

  revalidatePath("/admin/cafes")
  return { data: { slug } }
}
```

- [ ] **Step 3.5: Run test to verify it passes**

```bash
cd web && npx vitest run src/actions/cafe.actions.test.ts
```

Expected: all tests PASS.

- [ ] **Step 3.6: Implement createRoasterProposal in roaster.actions.ts**

Add to `web/src/actions/roaster.actions.ts`:

```typescript
import { ProposeRoasterSchema } from "@/types/actions"

export async function createRoasterProposal(
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  // parse arrays from form — multi-value fields sent as repeated keys
  const raw: Record<string, unknown> = {}
  for (const key of formData.keys()) {
    const values = formData.getAll(key)
    raw[key] = values.length > 1 ? values : values[0]
  }

  const parsed = ProposeRoasterSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { name, city, country, website, instagram, email, shopUrl,
    description, certifications, origins, roastStyles, openingHours: hoursRaw } = parsed.data

  const countryCode = resolveCountryCode(country)
  const slug = await generateUniqueRoasterSlug(name, city)

  let openingHours: Prisma.InputJsonValue | undefined = undefined
  if (hoursRaw) {
    try { openingHours = JSON.parse(hoursRaw) } catch { /* skip */ }
  }

  await db.roaster.create({
    data: {
      name,
      city,
      country,
      countryCode,
      slug,
      status: "PENDING",
      website: website || null,
      instagram: instagram || null,
      email: email || null,
      shopUrl: shopUrl || null,
      description: description || null,
      certifications: certifications ?? [],
      origins: origins ?? [],
      roastStyles: roastStyles ?? [],
      openingHours,
    },
  })

  revalidatePath("/admin/roasters")
  return { data: { slug } }
}
```

- [ ] **Step 3.7: Add createRoasterProposal tests**

Add to `web/src/actions/roaster.actions.test.ts`:

```typescript
// Add to imports:
import { createRoasterProposal } from "@/actions/roaster.actions"

// Add to mocks if generateUniqueRoasterSlug not already mocked:
vi.mock("@/lib/slug", () => ({
  generateUniqueCafeSlug: vi.fn(),
  generateUniqueRoasterSlug: vi.fn(),
}))

describe("createRoasterProposal", () => {
  it("creates PENDING roaster with no ownerId and returns slug", async () => {
    // mockCreate for roaster — check existing mock setup, add roaster.create if needed
    const mockRoasterCreate = db.roaster.create as unknown as ReturnType<typeof vi.fn>
    mockRoasterCreate.mockResolvedValue({ slug: "test-roastery" })
    vi.mocked(generateUniqueRoasterSlug).mockResolvedValue("test-roastery")

    const fd = new FormData()
    fd.set("name", "Test Roastery")
    fd.set("city", "Kraków")
    fd.set("country", "Poland")

    const result = await createRoasterProposal(fd)

    expect(result).toEqual({ data: { slug: "test-roastery" } })
    expect(mockRoasterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          name: "Test Roastery",
        }),
      })
    )
  })

  it("returns fieldError when name is too short", async () => {
    const fd = new FormData()
    fd.set("name", "X")
    fd.set("city", "Kraków")
    fd.set("country", "Poland")
    const result = await createRoasterProposal(fd)
    expect(result).toHaveProperty("fieldErrors.name")
  })
})
```

- [ ] **Step 3.8: Run all action tests**

```bash
cd web && npx vitest run src/actions/
```

Expected: all tests PASS.

- [ ] **Step 3.9: Commit**

```bash
git add web/src/types/actions.ts web/src/actions/cafe.actions.ts web/src/actions/roaster.actions.ts web/src/actions/cafe.actions.test.ts web/src/actions/roaster.actions.test.ts
git commit -m "ACTION: add createCafeProposal + createRoasterProposal with Zod schemas and tests"
```

---

## Task 4: /suggest/cafe page

> ⚠️ **Before building UI:** invoke `/frontend-design`, `/form-cro`, `/tailwind-patterns` skills for implementation guidance.

**Files:**
- Create: `web/src/app/suggest/cafe/page.tsx`
- Create: `web/src/app/suggest/cafe/_components/SuggestCafeForm.tsx`

- [ ] **Step 4.1: Create page shell with metadata**

Create `web/src/app/suggest/cafe/page.tsx`:

```typescript
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
```

- [ ] **Step 4.2: Create SuggestCafeForm accordion client component**

Create `web/src/app/suggest/cafe/_components/SuggestCafeForm.tsx`.

The component must implement:
1. **State:** `openSection: 1 | 2 | 3`, `formState` (all fields), `submitted: boolean`, `isPending`
2. **Section 1 (always open, cannot close):** `name` (required), `city` (required), `country` dropdown (required). Info hint below fields.
3. **Section 2 (toggle):** `address`, `website` (auto-prepend `https://` on blur if missing), `instagram` (auto-prepend `@` on blur if missing), `phone`, `email`, `description` (textarea with live char counter, max 500).
4. **Section 3 (toggle, shows teaser when closed):** `OpeningHoursPicker`, services checkboxes from `@/constants/cafe-services` grouped by `group` field.
5. **Submit button:** visible always, enabled when `name.length >= 2 && city && country`, shows spinner during submission.
6. **Success state:** replace form with confirmation card — "Dziękujemy! Zweryfikujemy i opublikujemy wkrótce." + link back to `/cafes`.
7. **Inline validation:** show field errors on blur, not on initial render.
8. **Services serialization:** join selected service values with comma before submitting.
9. **OpeningHours serialization:** `JSON.stringify(hours)` before submitting.

```typescript
"use client"

import { useState, useTransition } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { OpeningHoursPicker } from "@/components/shared/OpeningHoursPicker"
import { CAFE_SERVICES } from "@/constants/cafe-services"
import { EMPTY_OPENING_HOURS, OpeningHours } from "@/types/opening-hours"
import { createCafeProposal } from "@/actions/cafe.actions"

// Group services by their group field
const SERVICE_GROUPS = CAFE_SERVICES.reduce(
  (acc, s) => {
    if (!acc[s.group]) acc[s.group] = []
    acc[s.group].push(s)
    return acc
  },
  {} as Record<string, typeof CAFE_SERVICES[number][]>
)

const GROUP_LABELS: Record<string, string> = {
  amenities: "Udogodnienia",
  food: "Jedzenie",
  coffee: "Kawa",
  service: "Serwis",
}

export function SuggestCafeForm() {
  const [openSection, setOpenSection] = useState<2 | 3 | null>(null)
  const [hours, setHours] = useState<OpeningHours>(EMPTY_OPENING_HOURS)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set("openingHours", JSON.stringify(hours))
    fd.set("services", selectedServices.join(","))

    startTransition(async () => {
      const result = await createCafeProposal(fd)
      if ("fieldErrors" in result && result.fieldErrors) {
        setServerErrors(result.fieldErrors as Record<string, string[]>)
      } else {
        setSubmitted(true)
      }
    })
  }

  function getError(field: string) {
    if (!touched[field]) return null
    return serverErrors[field]?.[0] ?? null
  }

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-800 bg-green-950/30 p-8 text-center">
        <div className="mb-3 text-4xl">✓</div>
        <h2 className="mb-2 text-xl font-semibold text-green-300">
          Dziękujemy za propozycję!
        </h2>
        <p className="mb-6 text-gray-400">
          Zweryfikujemy i opublikujemy wkrótce.
        </p>
        <a
          href="/cafes"
          className="inline-block rounded-lg bg-white/10 px-5 py-2 text-sm text-gray-300 hover:bg-white/15 transition-colors"
        >
          Przeglądaj kawiarnie →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0 overflow-hidden rounded-xl border border-white/10">
      {/* Section 1 — Required */}
      <div className="border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/5 px-6 py-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-black">1</span>
          <span className="font-semibold text-gray-100">Podstawowe informacje</span>
          <span className="ml-auto text-xs font-medium text-[var(--color-accent)]">WYMAGANE</span>
        </div>
        <div className="flex flex-col gap-4 bg-black/20 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs text-gray-400">
              Nazwa kawiarni <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="np. Blackout Coffee & Bar"
              onBlur={() => markTouched("name")}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            {getError("name") && <p className="mt-1 text-xs text-red-400">{getError("name")}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Miasto <span className="text-[var(--color-accent)]">*</span>
              </label>
              <input
                name="city"
                required
                minLength={2}
                placeholder="np. Warszawa"
                onBlur={() => markTouched("city")}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Kraj <span className="text-[var(--color-accent)]">*</span>
              </label>
              <input
                name="country"
                required
                placeholder="np. Poland"
                onBlur={() => markTouched("country")}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
          <p className="rounded-lg bg-white/5 px-4 py-3 text-xs text-gray-500">
            💡 To wystarczy, żeby dodać miejsce. Reszta poniżej jest opcjonalna.
          </p>
        </div>
      </div>

      {/* Section 2 — Contact */}
      <div className="border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 2 ? null : 2)}
          className="flex w-full items-center gap-3 bg-black/10 px-6 py-4 hover:bg-white/5 transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-gray-500">2</span>
          <span className="font-medium text-gray-300">Kontakt i lokalizacja</span>
          <span className="ml-auto flex items-center gap-2 text-xs text-gray-600">
            opcjonalne
            {openSection === 2 ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </span>
        </button>
        {openSection === 2 && (
          <div className="flex flex-col gap-4 bg-black/20 px-6 py-5">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Adres</label>
              <input
                name="address"
                placeholder="ul. Przykładowa 12, 00-001 Warszawa"
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="mt-1 text-xs text-gray-600">Pomaga w znalezieniu na mapie</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Strona www</label>
                <input
                  name="website"
                  type="url"
                  placeholder="https://"
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (v && !v.startsWith("http")) e.target.value = "https://" + v
                    markTouched("website")
                  }}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                {getError("website") && <p className="mt-1 text-xs text-red-400">{getError("website")}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Instagram</label>
                <input
                  name="instagram"
                  placeholder="@nazwa"
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (v && !v.startsWith("@")) e.target.value = "@" + v
                  }}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Telefon</label>
                <input name="phone" placeholder="+48 000 000 000"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">E-mail kontaktowy</label>
                <input name="email" type="email" placeholder="cafe@example.com"
                  onBlur={() => markTouched("email")}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                {getError("email") && <p className="mt-1 text-xs text-red-400">{getError("email")}</p>}
                <p className="mt-1 text-xs text-gray-600">Nie będzie widoczny publicznie</p>
              </div>
            </div>
            <DescriptionField maxLength={500} />
          </div>
        )}
        {openSection !== 2 && (
          <p className="px-6 py-2 text-xs text-gray-600 bg-black/20">
            Adres, strona www, instagram, telefon, e-mail, opis
          </p>
        )}
      </div>

      {/* Section 3 — Details */}
      <div className="border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 3 ? null : 3)}
          className="flex w-full items-center gap-3 bg-black/10 px-6 py-4 hover:bg-white/5 transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-gray-500">3</span>
          <span className="font-medium text-gray-300">Szczegóły kawiarni</span>
          <span className="ml-auto flex items-center gap-2 text-xs text-gray-600">
            opcjonalne
            {openSection === 3 ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </span>
        </button>
        {openSection === 3 && (
          <div className="flex flex-col gap-6 bg-black/20 px-6 py-5">
            <div>
              <label className="mb-3 block text-xs font-medium uppercase tracking-widest text-gray-500">Godziny otwarcia</label>
              <OpeningHoursPicker value={hours} onChange={setHours} />
            </div>
            <div>
              <label className="mb-3 block text-xs font-medium uppercase tracking-widest text-gray-500">Serwisy i udogodnienia</label>
              {Object.entries(SERVICE_GROUPS).map(([group, services]) => (
                <div key={group} className="mb-4">
                  <p className="mb-2 text-xs text-gray-500">{GROUP_LABELS[group] ?? group}</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <label key={s.value} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                        selectedServices.includes(s.value)
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                          : "border-white/10 text-gray-500 hover:border-white/20"
                      }`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedServices.includes(s.value)}
                          onChange={(e) => {
                            setSelectedServices((prev) =>
                              e.target.checked
                                ? [...prev, s.value]
                                : prev.filter((v) => v !== s.value)
                            )
                          }}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {openSection !== 3 && (
          <p className="bg-black/20 px-6 py-2 text-xs text-gray-600">
            Godziny otwarcia, serwisy (Wi-Fi, pies, jedzenie…)
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="bg-black/20 px-6 py-5">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Wysyłanie…" : "Zaproponuj kawiarnię →"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-600">
          Nie musisz zakładać konta. Twoja propozycja trafi do weryfikacji.
        </p>
      </div>
    </form>
  )
}

function DescriptionField({ maxLength }: { maxLength: number }) {
  const [count, setCount] = useState(0)
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">Krótki opis</label>
      <textarea
        name="description"
        maxLength={maxLength}
        placeholder="Czym wyróżnia się to miejsce?"
        rows={3}
        onChange={(e) => setCount(e.target.value.length)}
        className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
      />
      <p className="mt-1 text-right text-xs text-gray-600">{count} / {maxLength}</p>
    </div>
  )
}
```

- [ ] **Step 4.3: Validate**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.4: Start dev server and test form manually**

```bash
cd web && npm run dev
```

Open `http://localhost:3000/suggest/cafe`. Verify:
- Section 1 fields visible, submit button enabled after filling name+city+country
- Clicking section 2 header expands it; clicking again collapses
- Section 3 shows OpeningHoursPicker with Smart Monday behavior
- Submit sends PENDING cafe to DB (check admin panel at `/admin/cafes`)
- Success card appears in-place without redirect

- [ ] **Step 4.5: Commit**

```bash
git add web/src/app/suggest/
git commit -m "UI: add /suggest/cafe accordion form with OpeningHoursPicker and service checkboxes"
```

---

## Task 5: /suggest/roastery page

> ⚠️ **Before building UI:** invoke `/frontend-design`, `/form-cro`, `/tailwind-patterns` if not already done.

**Files:**
- Create: `web/src/app/suggest/roastery/page.tsx`
- Create: `web/src/app/suggest/roastery/_components/SuggestRoasteryForm.tsx`

- [ ] **Step 5.1: Create page shell**

Create `web/src/app/suggest/roastery/page.tsx`:

```typescript
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
```

- [ ] **Step 5.2: Create SuggestRoasteryForm**

Create `web/src/app/suggest/roastery/_components/SuggestRoasteryForm.tsx`.

Follow the exact same accordion pattern as `SuggestCafeForm` with these differences:

- **Section 2:** `website`, `shopUrl`, `instagram`, `email`, `description` (no address/phone)
- **Section 3:** Certification checkboxes (from `@/types/certifications`), Origins pill-toggles, Roast Styles pill-toggles, `OpeningHoursPicker`
- **Action:** calls `createRoasterProposal(fd)` instead of `createCafeProposal`
- **Arrays:** certifications/origins/roastStyles appended as repeated `FormData` keys (e.g., `fd.append("certifications", value)` for each selected item)
- **Success text:** "Dziękujemy! Twoja palarnia trafi do weryfikacji wkrótce."

Import constants from `@/types/certifications` — use `CERTIFICATIONS`, `ORIGINS`, `ROAST_STYLES` arrays.

- [ ] **Step 5.3: Validate and test**

```bash
cd web && npx tsc --noEmit
```

Open `http://localhost:3000/suggest/roastery`. Verify pill toggles, accordion, OpeningHoursPicker, successful submission.

- [ ] **Step 5.4: Commit**

```bash
git add web/src/app/suggest/
git commit -m "UI: add /suggest/roastery accordion form with certifications, origins, roast styles"
```

---

## Task 6: Admin cafe master editor — sidebar layout

> ⚠️ **Before building UI:** invoke `/frontend-design`, `/tailwind-patterns` skills.

**Files:**
- Modify: `web/src/actions/cafe.actions.ts` — extend `adminUpdateCafe`
- Create: `web/src/app/admin/cafes/[id]/_sections/` (7 section components)
- Rewrite: `web/src/app/admin/cafes/[id]/client.tsx`

- [ ] **Step 6.1: Extend adminUpdateCafe to accept all fields**

In `web/src/actions/cafe.actions.ts`, update `adminUpdateCafe` signature and body to accept:

```typescript
export async function adminUpdateCafe(
  cafeId: string,
  data: {
    name?: string
    city?: string
    country?: string
    countryCode?: string
    description?: string | null
    address?: string | null
    postalCode?: string | null
    website?: string | null
    email?: string | null
    instagram?: string | null
    phone?: string | null
    priceRange?: string | null
    seatingCapacity?: number | null
    openingHours?: Prisma.InputJsonValue | null
    services?: string[]
    serving?: string[]
    logoUrl?: string | null
    coverImageUrl?: string | null
    sourceUrl?: string | null
    featured?: boolean
    featuredUntil?: Date | null
    ownerId?: string | null
  }
): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin()
  const cafe = await db.cafe.update({
    where: { id: cafeId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: { slug: true },
  })
  revalidatePath(`/admin/cafes/${cafeId}`)
  revalidatePath(`/cafes/${cafe.slug}`)
  revalidatePath("/cafes")
  return { data: { slug: cafe.slug } }
}
```

- [ ] **Step 6.2: Create IdentitySection**

Create `web/src/app/admin/cafes/[id]/_sections/IdentitySection.tsx`:

```typescript
"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"

interface Props {
  cafeId: string
  initial: {
    name: string
    city: string
    country: string
    countryCode: string
    description: string | null
    priceRange: string | null
    seatingCapacity: number | null
  }
}

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"]
const PRICE_RANGE_HINTS: Record<string, string> = {
  "$": "do ~10 zł",
  "$$": "~10-25 zł",
  "$$$": "~25-40 zł",
  "$$$$": "powyżej 40 zł",
}

export function IdentitySection({ cafeId, initial }: Props) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, {
      name: form.name,
      city: form.city,
      country: form.country,
      countryCode: form.countryCode,
      description: form.description || null,
      priceRange: form.priceRange || null,
      seatingCapacity: form.seatingCapacity,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Tożsamość" hint="Podstawowe dane kawiarni" />
      <Field label="Nazwa" required>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={adminInput} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Miasto" required>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={adminInput} />
        </Field>
        <Field label="Kraj" required>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={adminInput} />
        </Field>
      </div>
      <Field label="Kod kraju (2-literowy)">
        <input value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase().slice(0, 2) })}
          className={adminInput} maxLength={2} />
        <Hint>Auto-derived from country — update if wrong</Hint>
      </Field>
      <Field label="Opis">
        <textarea value={form.description ?? ""} rows={4}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={adminInput + " resize-none"} maxLength={2000} />
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>Widoczny na profilu kawiarni</span>
          <span>{(form.description ?? "").length} / 2000</span>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Przedział cenowy">
          <select value={form.priceRange ?? ""} onChange={(e) => setForm({ ...form, priceRange: e.target.value || null })}
            className={adminInput}>
            <option value="">— nie ustawiono —</option>
            {PRICE_RANGES.map((p) => (
              <option key={p} value={p}>{p} — {PRICE_RANGE_HINTS[p]}</option>
            ))}
          </select>
        </Field>
        <Field label="Liczba miejsc">
          <input type="number" min={0} value={form.seatingCapacity ?? ""}
            onChange={(e) => setForm({ ...form, seatingCapacity: e.target.value ? Number(e.target.value) : null })}
            className={adminInput} placeholder="np. 40" />
          <Hint>Przybliżona pojemność kawiarni</Hint>
        </Field>
      </div>
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
```

- [ ] **Step 6.3: Create remaining section components**

Create each of the following using the same pattern as `IdentitySection` (state + form fields + `adminUpdateCafe` call + `SaveButton`):

**`LocationSection.tsx`** — fields: `address`, `postalCode`, `lat` (number), `lng` (number), `sourceUrl`. Hint on lat/lng: "Geocoding automatyczny — przyszła funkcja. Wprowadź ręcznie z Google Maps."

**`ContactSection.tsx`** — fields: `website`, `instagram` (with `@` prefix hint), `phone`, `email`. Hint on email: "Nie publikowany publicznie."

**`HoursSection.tsx`** — contains `OpeningHoursPicker`. Parse `initialHours` from JSON prop. On save: call `adminUpdateCafe(cafeId, { openingHours: hours })`.

**`ServicesSection.tsx`** — `serving` as comma-separated tag input (type value + Enter/comma to add tag, click ✕ to remove). `services` as grouped checkboxes from `CAFE_SERVICES` constant.

**`ImagesSection.tsx`** — display current `coverImageUrl` and `logoUrl` with edit inputs. Hint: "Upload via UploadThing in dashboard — here you can paste/correct URL."

**`AdminSection.tsx`** — `status` display (badge, read-only — changed via Verify/Reject buttons in toolbar), `featured` checkbox, `featuredUntil` date input, `ownerId` text input with hint "Leave empty for proposals with no claimed owner."

- [ ] **Step 6.4: Create shared admin UI primitives**

Create `web/src/app/admin/cafes/[id]/_sections/_shared.tsx`:

```typescript
export const adminInput = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-40"

export function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <h2 className="text-base font-semibold text-gray-100">{title}</h2>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">
        {label}{required && <span className="ml-0.5 text-[var(--color-accent)]">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-gray-600">{children}</p>
}

export function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="self-start rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {saving ? "Zapisywanie…" : saved ? "✓ Zapisano" : "Zapisz sekcję"}
    </button>
  )
}
```

- [ ] **Step 6.5: Rewrite admin cafe client.tsx with sidebar layout**

Rewrite `web/src/app/admin/cafes/[id]/client.tsx` to:

```typescript
"use client"

import { useState } from "react"
import { useTransition } from "react"
import { verifyCafe, rejectCafe } from "@/actions/cafe.actions"
import { IdentitySection } from "./_sections/IdentitySection"
import { LocationSection } from "./_sections/LocationSection"
import { ContactSection } from "./_sections/ContactSection"
import { HoursSection } from "./_sections/HoursSection"
import { ServicesSection } from "./_sections/ServicesSection"
import { ImagesSection } from "./_sections/ImagesSection"
import { AdminSection } from "./_sections/AdminSection"

type Section = "identity" | "location" | "contact" | "hours" | "services" | "images" | "admin"

const SECTIONS: { id: Section; label: string }[] = [
  { id: "identity", label: "Tożsamość" },
  { id: "location", label: "Lokalizacja & Mapa" },
  { id: "contact", label: "Kontakt" },
  { id: "hours", label: "Godziny otwarcia" },
  { id: "services", label: "Serwisy & Amenities" },
  { id: "images", label: "Zdjęcia" },
  { id: "admin", label: "Admin & Status" },
]

interface Props {
  cafe: {
    id: string; name: string; slug: string; status: string
    city: string; country: string; countryCode: string; description: string | null
    address: string | null; postalCode: string | null; lat: number | null; lng: number | null; sourceUrl: string | null
    website: string | null; instagram: string | null; phone: string | null; email: string | null
    openingHours: unknown; services: string[]; serving: string[]
    priceRange: string | null; seatingCapacity: number | null
    coverImageUrl: string | null; logoUrl: string | null
    featured: boolean; featuredUntil: Date | null; ownerId: string | null
    rejectedReason: string | null
  }
}

export function AdminCafeClient({ cafe }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("identity")
  const [isPending, startTransition] = useTransition()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  function handleVerify() {
    if (!confirm("Zweryfikować tę kawiarnię?")) return
    startTransition(() => verifyCafe(cafe.id))
  }

  function handleReject() {
    if (!rejectReason.trim()) return
    startTransition(async () => {
      await rejectCafe(cafe.id, rejectReason)
      setShowRejectModal(false)
    })
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Sticky toolbar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-black/50 px-6 py-3 backdrop-blur">
        <div>
          <span className="font-semibold text-gray-100">{cafe.name}</span>
          <span className="ml-2 text-sm text-gray-500">{cafe.city}, {cafe.country}</span>
        </div>
        <StatusBadge status={cafe.status} />
        <div className="ml-auto flex gap-2">
          {cafe.status === "PENDING" && (
            <>
              <button onClick={handleVerify} disabled={isPending}
                className="rounded-lg bg-green-900/50 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-900 transition-colors disabled:opacity-40">
                ✓ Zweryfikuj
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={isPending}
                className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-40">
                ✗ Odrzuć
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-48 flex-shrink-0 border-r border-white/10 bg-black/20 py-4">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                activeSection === s.id
                  ? "border-l-2 border-[var(--color-accent)] bg-white/5 font-medium text-[var(--color-accent)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "identity" && <IdentitySection cafeId={cafe.id} initial={cafe} />}
          {activeSection === "location" && <LocationSection cafeId={cafe.id} initial={cafe} />}
          {activeSection === "contact" && <ContactSection cafeId={cafe.id} initial={cafe} />}
          {activeSection === "hours" && <HoursSection cafeId={cafe.id} initialHours={cafe.openingHours} />}
          {activeSection === "services" && <ServicesSection cafeId={cafe.id} initial={{ services: cafe.services, serving: cafe.serving }} />}
          {activeSection === "images" && <ImagesSection cafeId={cafe.id} initial={cafe} />}
          {activeSection === "admin" && <AdminSection cafeId={cafe.id} initial={cafe} />}
        </main>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-3 font-semibold text-gray-100">Powód odrzucenia</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Dlaczego ta kawiarnia jest odrzucana?"
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400">
                Anuluj
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isPending}
                className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-900 disabled:opacity-40">
                Odrzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-900/50 text-yellow-400",
    VERIFIED: "bg-green-900/50 text-green-400",
    REJECTED: "bg-red-900/50 text-red-400",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-800 text-gray-400"}`}>
      {status}
    </span>
  )
}
```

- [ ] **Step 6.6: Update page.tsx to pass full cafe data**

In `web/src/app/admin/cafes/[id]/page.tsx`, ensure the DB query selects all fields needed by the new client component (openingHours, services, serving, postalCode, logoUrl, sourceUrl, featured, featuredUntil, ownerId, rejectedReason).

Check the existing select and add any missing fields.

- [ ] **Step 6.7: Validate and test manually**

```bash
cd web && npx tsc --noEmit
```

Open `http://localhost:3000/admin/cafes/[any-id]`. Verify:
- Sidebar navigation between 7 sections
- Each section loads correct fields
- "Zapisz sekcję" saves only that section's fields
- Verify/Reject buttons work with confirmation
- Reject requires a reason before button activates

- [ ] **Step 6.8: Commit**

```bash
git add web/src/app/admin/cafes/ web/src/actions/cafe.actions.ts
git commit -m "UI: admin cafe master editor — sidebar layout with 7 sections, all schema fields"
```

---

## Task 7: Admin roaster master editor — sidebar layout

**Files:**
- Modify: `web/src/actions/admin.actions.ts` — extend `adminUpdateRoaster`
- Create: `web/src/app/admin/roasters/[id]/_sections/` (8 section components)
- Rewrite: `web/src/app/admin/roasters/[id]/client.tsx`

- [ ] **Step 7.1: Extend adminUpdateRoaster**

In `web/src/actions/admin.actions.ts`, update `adminUpdateRoaster` to accept all schema fields:

```typescript
export async function adminUpdateRoaster(
  roasterId: string,
  data: {
    name?: string
    city?: string
    country?: string
    countryCode?: string
    description?: string | null
    foundedYear?: number | null
    address?: string | null
    postalCode?: string | null
    lat?: number | null
    lng?: number | null
    sourceUrl?: string | null
    website?: string | null
    shopUrl?: string | null
    instagram?: string | null
    facebook?: string | null
    phone?: string | null
    email?: string | null
    certifications?: string[]
    origins?: string[]
    roastStyles?: string[]
    brewingMethods?: string[]
    openingHours?: Prisma.InputJsonValue | null
    wholesaleAvailable?: boolean | null
    subscriptionAvailable?: boolean | null
    hasCafe?: boolean | null
    hasTastingRoom?: boolean | null
    coverImageUrl?: string | null
    featured?: boolean
    featuredUntil?: Date | null
    ownerId?: string | null
  }
): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin()
  const roaster = await db.roaster.update({
    where: { id: roasterId },
    data: { ...data, updatedAt: new Date() },
    select: { slug: true },
  })
  revalidatePath(`/admin/roasters/${roasterId}`)
  revalidatePath(`/roasters/${roaster.slug}`)
  revalidatePath("/roasters")
  return { data: { slug: roaster.slug } }
}
```

- [ ] **Step 7.2: Create roaster section components**

Mirror the cafe section pattern. Create 8 sections in `web/src/app/admin/roasters/[id]/_sections/`:

**`IdentitySection.tsx`** — name, slug (read-only with hint), city, country, countryCode, description (2000 chars), foundedYear (number input)

**`LocationSection.tsx`** — address, postalCode, lat, lng (manual entry), sourceUrl

**`ContactSection.tsx`** — website, shopUrl, instagram, facebook, phone, email

**`CoffeeSection.tsx`** — certifications (checkboxes from `CERTIFICATIONS`), origins (pill toggles from `ORIGINS`), roastStyles (pill toggles from `ROAST_STYLES`), brewingMethods (tag input — type + Enter to add, click ✕ to remove)

**`HoursSection.tsx`** — identical to cafe's: `OpeningHoursPicker` component, saves via `adminUpdateRoaster(id, { openingHours })`

**`OfferSection.tsx`** — four boolean toggles with descriptive labels:
- `wholesaleAvailable` → "Hurtownia / dostawa B2B"
- `subscriptionAvailable` → "Subskrypcja kawy"  
- `hasCafe` → "Prowadzi kawiarnię"
- `hasTastingRoom` → "Sala degustacyjna / tasting room"

**`ImagesSection.tsx`** — coverImageUrl input + list of RoasterImage entries with delete button (calls `deleteRoasterImage` action)

**`AdminSection.tsx`** — status badge (read-only), featured checkbox, featuredUntil date, ownerId text input

- [ ] **Step 7.3: Rewrite admin roaster client.tsx**

Rewrite `web/src/app/admin/roasters/[id]/client.tsx` using the same sidebar pattern as the cafe client. Sections: identity, location, contact, coffee, hours, offer, images, admin. Use `verifyRoaster` and `rejectRoaster` from `@/actions/admin.actions` in the toolbar.

- [ ] **Step 7.4: Update roaster page.tsx query**

Ensure `/admin/roasters/[id]/page.tsx` selects all new fields: `openingHours`, `foundedYear`, `facebook`, `hasCafe`, `hasTastingRoom`, `wholesaleAvailable`, `subscriptionAvailable`, `featured`, `featuredUntil`, `ownerId`, `rejectedReason`, `coverImageUrl`.

- [ ] **Step 7.5: Validate and test**

```bash
cd web && npx tsc --noEmit
```

Open `http://localhost:3000/admin/roasters/[any-id]`. Verify all 8 sections load, save correctly, and the toolbar works.

- [ ] **Step 7.6: Commit**

```bash
git add web/src/app/admin/roasters/ web/src/actions/admin.actions.ts
git commit -m "UI: admin roaster master editor — sidebar layout with 8 sections, all schema fields"
```

---

## Task 8: Navigation CTAs

**Files:**
- Modify: `web/src/components/shared/Header.tsx`
- Modify: `web/src/components/shared/Footer.tsx`
- Modify: `web/src/app/cafes/page.tsx`
- Modify: `web/src/app/roasters/page.tsx`

- [ ] **Step 8.1: Update Header — dropdown CTA**

In `web/src/components/shared/Header.tsx`, replace the single "List Your Roastery" link with a dropdown that contains:

```typescript
// Desktop nav — replace existing "List Your Roastery" with:
<div className="relative group">
  <button className="flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:opacity-80 transition-opacity">
    Dodaj miejsce
    <ChevronDownIcon className="h-3.5 w-3.5" />
  </button>
  <div className="absolute right-0 top-full z-50 mt-2 hidden w-56 rounded-xl border border-white/10 bg-[#111] p-2 shadow-xl group-hover:block">
    <a href="/register" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors">
      <div className="font-medium text-gray-100">Mam palarnię</div>
      <div className="text-xs text-gray-500">Zarejestruj swoją palarnię</div>
    </a>
    <a href="/register/cafe" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors">
      <div className="font-medium text-gray-100">Mam kawiarnię</div>
      <div className="text-xs text-gray-500">Zarejestruj swoją kawiarnię</div>
    </a>
    <div className="my-1 border-t border-white/10" />
    <a href="/suggest/roastery" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors">
      <div className="font-medium text-gray-100">Znam świetną palarnię</div>
      <div className="text-xs text-gray-500">Zaproponuj miejsce</div>
    </a>
    <a href="/suggest/cafe" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 transition-colors">
      <div className="font-medium text-gray-100">Znam świetną kawiarnię</div>
      <div className="text-xs text-gray-500">Zaproponuj miejsce</div>
    </a>
  </div>
</div>
```

- [ ] **Step 8.2: Update Footer**

In `web/src/components/shared/Footer.tsx`, in the "Join Us" section, add suggest links alongside existing register links:

```typescript
// Add under existing "List Your Cafe" link:
<a href="/suggest/roastery" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
  Zaproponuj palarnię
</a>
<a href="/suggest/cafe" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
  Zaproponuj kawiarnię
</a>
```

- [ ] **Step 8.3: Add banner to /cafes page**

In `web/src/app/cafes/page.tsx`, add a banner below the main cafe grid (or at bottom of page, before footer):

```typescript
{/* Suggest banner */}
<div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
  <p className="mb-2 text-gray-300">Brakuje Twojej ulubionej kawiarni?</p>
  <a
    href="/suggest/cafe"
    className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
  >
    Zaproponuj kawiarnię →
  </a>
</div>
```

- [ ] **Step 8.4: Add banner to /roasters page**

In `web/src/app/roasters/page.tsx`, add an identical banner at bottom:

```typescript
{/* Suggest banner */}
<div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
  <p className="mb-2 text-gray-300">Nie ma tu Twojej ulubionej palarni?</p>
  <a
    href="/suggest/roastery"
    className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
  >
    Zaproponuj palarnię →
  </a>
</div>
```

- [ ] **Step 8.5: Validate and test**

```bash
cd web && npx tsc --noEmit && npx eslint src --ext .ts,.tsx --max-warnings 0
```

Open `http://localhost:3000` — verify dropdown appears on hover, links work, banners visible on /cafes and /roasters.

- [ ] **Step 8.6: Commit**

```bash
git add web/src/components/shared/ web/src/app/cafes/page.tsx web/src/app/roasters/page.tsx
git commit -m "UI: add 'Zaproponuj miejsce' CTAs — header dropdown, footer links, listing page banners"
```

---

## Final: Lint, consistency check, and PR

- [ ] **Step F.1: Run full lint and type check**

```bash
cd web && npm run lint && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step F.2: Run all tests**

```bash
cd web && npx vitest run
```

Expected: all tests PASS.

- [ ] **Step F.3: Run consistency check**

```bash
cd /workspaces/roasters-hub && python tools/consistency_check.py
```

Expected: no C1/C2/C3/C4/C7/C11 failures.

- [ ] **Step F.4: Update ROADMAP.md**

Mark completed tasks with `[x]`:
- `[x]` Schema: migracja Cafe.openingHours + usunięcie duplikatu
- `[x]` Komponent OpeningHoursPicker
- `[x]` UI: /suggest/cafe + /suggest/roastery
- `[x]` Admin master editor: kawiarnie
- `[x]` Admin master editor: palarnie
- `[x]` Nawigacja: CTA "Zaproponuj miejsce"

- [ ] **Step F.5: Push and create PR**

```bash
git push origin feat/mn-data-consistency-proposal-flow
bash tools/create_agent_pr.sh
```

PR title: `[UI+DB] Data consistency + public proposal flow + admin master editor`
