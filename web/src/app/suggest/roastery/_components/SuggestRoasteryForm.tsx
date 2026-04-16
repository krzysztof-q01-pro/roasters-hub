"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { OpeningHoursPicker } from "@/components/shared/OpeningHoursPicker"
import { EMPTY_OPENING_HOURS, type OpeningHours } from "@/types/opening-hours"
import {
  CERTIFICATIONS,
  CERTIFICATION_LABELS,
  ORIGINS,
  ROAST_STYLES,
} from "@/types/certifications"
import { createRoasterProposal } from "@/actions/roaster.actions"

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

export function SuggestRoasteryForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Section open/closed state
  const [section2Open, setSection2Open] = useState(false)
  const [section3Open, setSection3Open] = useState(false)

  // Opening hours state
  const [hours, setHours] = useState<OpeningHours>(EMPTY_OPENING_HOURS)

  // Selected toggles state
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([])
  const [selectedRoastStyles, setSelectedRoastStyles] = useState<string[]>([])

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

  function handleShopUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    markTouched("shopUrl")
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

  function toggleCertification(value: string) {
    setSelectedCertifications((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function toggleOrigin(value: string) {
    setSelectedOrigins((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function toggleRoastStyle(value: string) {
    setSelectedRoastStyles((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGlobalError(null)
    setFieldErrors({})

    const form = e.currentTarget
    const fd = new FormData(form)

    // Serialize opening hours
    fd.set("openingHours", JSON.stringify(hours))

    // Append array fields (repeated keys)
    for (const cert of selectedCertifications) {
      fd.append("certifications", cert)
    }
    for (const origin of selectedOrigins) {
      fd.append("origins", origin)
    }
    for (const style of selectedRoastStyles) {
      fd.append("roastStyles", style)
    }

    startTransition(async () => {
      const result = await createRoasterProposal(fd)
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
          Dziękujemy! Twoja palarnia trafi do weryfikacji wkrótce.
        </p>
        <Link
          href="/roasters"
          className="inline-block rounded-md bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Przeglądaj palarnie
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
          <Field label="Nazwa palarni *" name="name" error={getFieldError("name")}>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="np. Specialty Roasters"
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

      {/* ── Section 2: Contact (collapsible) ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeader
          number={2}
          title="Kontakt i linki"
          open={section2Open}
          onToggle={() => setSection2Open((v) => !v)}
        />
        {section2Open && (
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Strona WWW" name="website" error={getFieldError("website")}>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://palarniaspecialty.pl"
                className={inputClass}
                onBlur={handleWebsiteBlur}
              />
            </Field>
            <Field label="Sklep online" name="shopUrl" error={getFieldError("shopUrl")}>
              <input
                id="shopUrl"
                name="shopUrl"
                type="url"
                placeholder="https://sklep.palarniaspecialty.pl"
                className={inputClass}
                onBlur={handleShopUrlBlur}
              />
            </Field>
            <Field label="Instagram" name="instagram" error={getFieldError("instagram")}>
              <input
                id="instagram"
                name="instagram"
                type="text"
                placeholder="@palarniaspecialty"
                className={inputClass}
                onBlur={handleInstagramBlur}
              />
            </Field>
            <Field label="E-mail" name="email" error={getFieldError("email")}>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="kontakt@palarniaspecialty.pl"
                className={inputClass}
                onBlur={() => markTouched("email")}
              />
            </Field>
            <DescriptionField error={getFieldError("description")} />
          </div>
        )}
      </div>

      {/* ── Section 3: Details (collapsible) ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeader
          number={3}
          title="Szczegóły palarni"
          open={section3Open}
          onToggle={() => setSection3Open((v) => !v)}
        />
        {section3Open && (
          <div className="mt-4 flex flex-col gap-6">
            {/* Certifications */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Certyfikaty
              </p>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => {
                  const checked = selectedCertifications.includes(cert)
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCertification(cert)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        checked
                          ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      {CERTIFICATION_LABELS[cert]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Origins */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Pochodzenie kaw
              </p>
              <div className="flex flex-wrap gap-2">
                {ORIGINS.map((origin) => {
                  const checked = selectedOrigins.includes(origin)
                  return (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => toggleOrigin(origin)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        checked
                          ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      {origin}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Roast Styles */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Style palenia
              </p>
              <div className="flex flex-wrap gap-2">
                {ROAST_STYLES.map((style) => {
                  const checked = selectedRoastStyles.includes(style)
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleRoastStyle(style)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        checked
                          ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      {style}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Godziny otwarcia
              </p>
              <OpeningHoursPicker value={hours} onChange={setHours} />
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
          "Zaproponuj palarnię →"
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
          placeholder="Krótki opis palarni…"
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
