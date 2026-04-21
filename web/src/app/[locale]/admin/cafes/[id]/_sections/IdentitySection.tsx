"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { adminInput, adminSelect, SectionHeader, Field, SaveButton } from "./_shared"

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

export function IdentitySection({ cafeId, initial }: Props) {
  const [form, setForm] = useState({
    name: initial.name,
    city: initial.city,
    country: initial.country,
    countryCode: initial.countryCode,
    description: initial.description ?? "",
    priceRange: initial.priceRange ?? "",
    seatingCapacity: initial.seatingCapacity?.toString() ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateCafe(cafeId, {
      name: form.name || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      countryCode: form.countryCode.toUpperCase().slice(0, 2) || undefined,
      description: form.description || null,
      priceRange: form.priceRange || null,
      seatingCapacity: form.seatingCapacity
        ? parseInt(form.seatingCapacity, 10) || null
        : null,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError(result.error ?? "Save failed")
    }
  }

  const descLen = form.description.length

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Identity" hint="Core identifying details for the cafe" />

      <Field label="Name" required>
        <input
          value={form.name}
          placeholder="e.g. Brew Lab"
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" required>
          <input
            value={form.city}
            placeholder="e.g. Warsaw"
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={adminInput}
          />
        </Field>

        <Field label="Country" required>
          <input
            value={form.country}
            placeholder="e.g. Poland"
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className={adminInput}
          />
        </Field>
      </div>

      <Field label="Country code (2 letters, e.g. PL)">
        <input
          value={form.countryCode}
          maxLength={2}
          placeholder="PL"
          onChange={(e) =>
            setForm((f) => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 2) }))
          }
          className={adminInput}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          maxLength={2000}
          rows={5}
          placeholder="Describe the cafe — atmosphere, specialty, what makes it stand out…"
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={adminInput}
        />
        <p className="mt-1 text-right text-xs text-[var(--color-outline)]">{descLen}/2000</p>
      </Field>

      <Field label="Price range">
        <select
          value={form.priceRange}
          onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
          className={adminSelect}
        >
          <option value="">— none —</option>
          <option value="$">$ (budget)</option>
          <option value="$$">$$ (mid-range)</option>
          <option value="$$$">$$$ (pricey)</option>
          <option value="$$$$">$$$$ (premium)</option>
        </select>
      </Field>

      <Field label="Seating capacity">
        <input
          type="number"
          min={0}
          placeholder="e.g. 40"
          value={form.seatingCapacity}
          onChange={(e) => setForm((f) => ({ ...f, seatingCapacity: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
    </div>
  )
}
