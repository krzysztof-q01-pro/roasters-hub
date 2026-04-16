"use client"

import { useState, KeyboardEvent } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { CERTIFICATIONS, CERTIFICATION_LABELS, ORIGINS, ROAST_STYLES } from "@/types/certifications"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    certifications: string[]
    origins: string[]
    roastStyles: string[]
    brewingMethods: string[]
  }
}

export function CoffeeSection({ roasterId, initial }: Props) {
  const [certifications, setCertifications] = useState<string[]>(initial.certifications)
  const [origins, setOrigins] = useState<string[]>(initial.origins)
  const [roastStyles, setRoastStyles] = useState<string[]>(initial.roastStyles)
  const [brewingMethods, setBrewingMethods] = useState<string[]>(initial.brewingMethods)
  const [brewingInput, setBrewingInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function toggleCert(value: string) {
    setCertifications((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    )
  }

  function toggleOrigin(value: string) {
    setOrigins((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value],
    )
  }

  function toggleRoastStyle(value: string) {
    setRoastStyles((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    )
  }

  function addBrewingMethod() {
    const val = brewingInput.trim()
    if (!val || brewingMethods.includes(val)) return
    setBrewingMethods((prev) => [...prev, val])
    setBrewingInput("")
  }

  function removeBrewingMethod(tag: string) {
    setBrewingMethods((prev) => prev.filter((m) => m !== tag))
  }

  function onBrewingKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addBrewingMethod()
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      certifications,
      origins,
      roastStyles,
      brewingMethods,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError(result.error ?? "Błąd zapisu")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Kawa i profile" hint="Certyfikaty, origine, style palenia i metody parzenia" />

      <Field label="Certyfikaty">
        <div className="grid grid-cols-2 gap-1.5">
          {CERTIFICATIONS.map((cert) => (
            <label
              key={cert}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={certifications.includes(cert)}
                onChange={() => toggleCert(cert)}
                className="accent-[var(--color-accent)] h-4 w-4"
              />
              {CERTIFICATION_LABELS[cert]}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Origine (kraje pochodzenia kawy)">
        <div className="flex flex-wrap gap-1.5">
          {ORIGINS.map((origin) => (
            <button
              key={origin}
              type="button"
              onClick={() => toggleOrigin(origin)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                origins.includes(origin)
                  ? "bg-[var(--color-accent)] text-black"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {origin}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Style palenia">
        <div className="flex flex-wrap gap-1.5">
          {ROAST_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleRoastStyle(style)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                roastStyles.includes(style)
                  ? "bg-[var(--color-accent)] text-black"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Metody parzenia (tagi)">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {brewingMethods.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeBrewingMethod(tag)}
                className="text-gray-500 hover:text-gray-200 leading-none"
                aria-label={`Usuń ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={brewingInput}
            onChange={(e) => setBrewingInput(e.target.value)}
            onKeyDown={onBrewingKeyDown}
            placeholder="Wpisz i naciśnij Enter…"
            className={adminInput}
          />
          <button
            type="button"
            onClick={addBrewingMethod}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/20"
          >
            Dodaj
          </button>
        </div>
        <Hint>Np. espresso, V60, AeroPress — naciśnij Enter po każdej metodzie</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
