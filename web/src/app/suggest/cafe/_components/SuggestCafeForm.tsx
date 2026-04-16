"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { OpeningHoursPicker } from "@/components/shared/OpeningHoursPicker"
import { CAFE_SERVICES } from "@/constants/cafe-services"
import { EMPTY_OPENING_HOURS, type OpeningHours } from "@/types/opening-hours"
import { createCafeProposal } from "@/actions/cafe.actions"

// Group labels for CAFE_SERVICES groups
const GROUP_LABELS: Record<string, string> = {
  amenities: "Udogodnienia",
  food: "Jedzenie",
  coffee: "Kawa",
  service: "Serwis",
}

// Get unique groups preserving order
const SERVICE_GROUPS = Array.from(
  new Set(CAFE_SERVICES.map((s) => s.group))
)

interface FieldErrors {
  [field: string]: string[] | undefined
}

interface SectionHeaderProps {
  number: number
  title: string
  required?: boolean
  open?: boolean
  onToggle?: () => void
}

function SectionHeader({ number, title, required, open, onToggle }: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center gap-3 ${onToggle ? "cursor-pointer select-none" : ""}`}
      onClick={onToggle}
      role={onToggle ? "button" : undefined}
      aria-expanded={onToggle ? open : undefined}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-300">
        {number}
      </span>
      <span className="text-sm font-semibold text-gray-200">{title}</span>
      {required && (
        <span className="rounded bg-[var(--color-accent)]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Wymagane
        </span>
      )}
      {!required && onToggle && (
        <span className="text-xs text-gray-600">opcjonalne</span>
      )}
      {onToggle && (
        <span className="ml-auto text-gray-500">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}

function Field({ label, name, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

const inputClass =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 transition-colors focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30"

export function SuggestCafeForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Section open/closed state
  const [section2Open, setSection2Open] = useState(false)
  const [section3Open, setSection3Open] = useState(false)

  // Opening hours state
  const [hours, setHours] = useState<OpeningHours>(EMPTY_OPENING_HOURS)

  // Selected services state
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Touched fields (for inline error display)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function markTouched(name: string) {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  function getFieldError(name: string): string | undefined {
    if (!touched[name]) return undefined
    return fieldErrors[name]?.[0]
  }

  function handleWebsiteBlur(e: React.FocusEvent<HTMLInputElement>) {
    markTouched("website")
    const val = e.target.value.trim()
    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      e.target.value = `https://${val}`
    }
  }

  function handleInstagramBlur(e: React.FocusEvent<HTMLInputElement>) {
    markTouched("instagram")
    const val = e.target.value.trim()
    if (val && !val.startsWith("@")) {
      e.target.value = `@${val}`
    }
  }

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGlobalError(null)
    setFieldErrors({})

    const form = e.currentTarget
    const fd = new FormData(form)

    // Serialize opening hours and services
    fd.set("openingHours", JSON.stringify(hours))
    fd.set("services", selectedServices.join(","))

    startTransition(async () => {
      const result = await createCafeProposal(fd)
      if (result.success) {
        setSuccess(true)
      } else {
        setGlobalError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
          // Mark all errored fields as touched
          const newTouched: Record<string, boolean> = {}
          for (const key of Object.keys(result.fieldErrors)) {
            newTouched[key] = true
          }
          setTouched((prev) => ({ ...prev, ...newTouched }))
        }
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mb-4 text-4xl">☕</div>
        <h2 className="mb-2 text-xl font-bold text-gray-100">Dziękujemy!</h2>
        <p className="mb-6 text-gray-400">
          Zweryfikujemy i opublikujemy wkrótce.
        </p>
        <Link
          href="/cafes"
          className="inline-block rounded-md bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Przeglądaj kawiarnie
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {/* ── Section 1: Required fields ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4">
          <SectionHeader number={1} title="Podstawowe informacje" required />
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Nazwa kawiarni *" name="name" error={getFieldError("name")}>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="np. Cafe Słodka"
              className={inputClass}
              onBlur={() => markTouched("name")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Miasto *" name="city" error={getFieldError("city")}>
              <input
                id="city"
                name="city"
                type="text"
                required
                maxLength={100}
                placeholder="np. Warszawa"
                className={inputClass}
                onBlur={() => markTouched("city")}
              />
            </Field>
            <Field label="Kraj *" name="country" error={getFieldError("country")}>
              <input
                id="country"
                name="country"
                type="text"
                required
                maxLength={60}
                placeholder="np. Polska"
                className={inputClass}
                onBlur={() => markTouched("country")}
              />
            </Field>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          💡 To wystarczy, żeby dodać miejsce. Reszta poniżej jest opcjonalna.
        </p>
      </div>

      {/* ── Section 2: Contact & details (collapsible) ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeader
          number={2}
          title="Kontakt i szczegóły"
          open={section2Open}
          onToggle={() => setSection2Open((v) => !v)}
        />
        {section2Open && (
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Adres" name="address" error={getFieldError("address")}>
              <input
                id="address"
                name="address"
                type="text"
                maxLength={200}
                placeholder="ul. Przykładowa 1"
                className={inputClass}
                onBlur={() => markTouched("address")}
              />
            </Field>
            <Field label="Strona WWW" name="website" error={getFieldError("website")}>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://kawiarnia.pl"
                className={inputClass}
                onBlur={handleWebsiteBlur}
              />
            </Field>
            <Field label="Instagram" name="instagram" error={getFieldError("instagram")}>
              <input
                id="instagram"
                name="instagram"
                type="text"
                placeholder="@kawiarnia"
                className={inputClass}
                onBlur={handleInstagramBlur}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefon" name="phone" error={getFieldError("phone")}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={30}
                  placeholder="+48 123 456 789"
                  className={inputClass}
                  onBlur={() => markTouched("phone")}
                />
              </Field>
              <Field label="E-mail" name="email" error={getFieldError("email")}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="kontakt@kawiarnia.pl"
                  className={inputClass}
                  onBlur={() => markTouched("email")}
                />
              </Field>
            </div>
            <DescriptionField error={getFieldError("description")} />
          </div>
        )}
      </div>

      {/* ── Section 3: Hours & services (collapsible) ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeader
          number={3}
          title="Godziny i usługi"
          open={section3Open}
          onToggle={() => setSection3Open((v) => !v)}
        />
        {section3Open && (
          <div className="mt-4 flex flex-col gap-6">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Godziny otwarcia
              </p>
              <OpeningHoursPicker value={hours} onChange={setHours} />
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Udogodnienia i usługi
              </p>
              <div className="flex flex-col gap-4">
                {SERVICE_GROUPS.map((group) => {
                  const services = CAFE_SERVICES.filter((s) => s.group === group)
                  return (
                    <div key={group}>
                      <p className="mb-2 text-xs font-semibold text-gray-500">
                        {GROUP_LABELS[group] ?? group}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {services.map((service) => {
                          const checked = selectedServices.includes(service.value)
                          return (
                            <button
                              key={service.value}
                              type="button"
                              onClick={() => toggleService(service.value)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                checked
                                  ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                              }`}
                            >
                              {service.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Global error ── */}
      {globalError && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {globalError}
        </p>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Wysyłam…
          </>
        ) : (
          "Zaproponuj kawiarnię"
        )}
      </button>
    </form>
  )
}

// Separated to keep lint happy (char counter needs its own state)
function DescriptionField({ error }: { error?: string }) {
  const [count, setCount] = useState(0)
  return (
    <Field label="Opis" name="description" error={error}>
      <div className="relative">
        <textarea
          id="description"
          name="description"
          maxLength={500}
          rows={4}
          placeholder="Krótki opis miejsca…"
          className={`${inputClass} resize-none`}
          onChange={(e) => setCount(e.target.value.length)}
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-600">
          {count}/500
        </span>
      </div>
    </Field>
  )
}
