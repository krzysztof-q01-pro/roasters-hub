"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { adminInput, SectionHeader, Field, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    name: string
    city: string
    country: string
    countryCode: string
    description: string | null
    foundedYear: number | null
  }
}

export function IdentitySection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    name: initial.name,
    city: initial.city,
    country: initial.country,
    countryCode: initial.countryCode,
    description: initial.description ?? "",
    foundedYear: initial.foundedYear?.toString() ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      name: form.name || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      countryCode: form.countryCode.toUpperCase().slice(0, 2) || undefined,
      description: form.description || null,
      foundedYear: form.foundedYear ? parseInt(form.foundedYear, 10) || null : null,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError(result.error ?? "Błąd zapisu")
    }
  }

  const descLen = form.description.length

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Tożsamość" hint="Podstawowe dane identyfikacyjne palarni" />

      <Field label="Nazwa" required>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Miasto" required>
          <input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={adminInput}
          />
        </Field>

        <Field label="Kraj" required>
          <input
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className={adminInput}
          />
        </Field>
      </div>

      <Field label="Kod kraju (2 litery, np. PL)">
        <input
          value={form.countryCode}
          maxLength={2}
          onChange={(e) =>
            setForm((f) => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 2) }))
          }
          className={adminInput}
        />
      </Field>

      <Field label="Rok założenia">
        <input
          type="number"
          min={1800}
          max={new Date().getFullYear()}
          value={form.foundedYear}
          onChange={(e) => setForm((f) => ({ ...f, foundedYear: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <Field label="Opis">
        <textarea
          value={form.description}
          maxLength={2000}
          rows={5}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={adminInput}
        />
        <p className="mt-1 text-right text-xs text-gray-600">{descLen}/2000</p>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
