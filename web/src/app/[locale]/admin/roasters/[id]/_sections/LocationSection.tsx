"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    address: string | null
    postalCode: string | null
    lat: number | null
    lng: number | null
    sourceUrl: string | null
  }
}

export function LocationSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    address: initial.address ?? "",
    postalCode: initial.postalCode ?? "",
    lat: initial.lat?.toString() ?? "",
    lng: initial.lng?.toString() ?? "",
    sourceUrl: initial.sourceUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      address: form.address || null,
      postalCode: form.postalCode || null,
      lat: form.lat ? parseFloat(form.lat) || null : null,
      lng: form.lng ? parseFloat(form.lng) || null : null,
      sourceUrl: form.sourceUrl || null,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError(result.error ?? "Save failed")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Location" hint="Street address and geographic coordinates of the roastery" />

      <Field label="Address">
        <input
          value={form.address}
          placeholder="e.g. ul. Fabryczna 12, Opole"
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <Field label="Postal code">
        <input
          value={form.postalCode}
          placeholder="e.g. 45-001"
          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <Field label="Source URL">
        <input
          value={form.sourceUrl}
          placeholder="e.g. https://maps.google.com/…"
          onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude">
          <input
            type="number"
            step="any"
            placeholder="e.g. 50.6751"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
            className={adminInput}
          />
        </Field>

        <Field label="Longitude">
          <input
            type="number"
            step="any"
            placeholder="e.g. 17.9213"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
            className={adminInput}
          />
        </Field>
      </div>
      <Hint>
        Find coordinates in Google Maps: right-click on the location and copy the lat/lng values.
      </Hint>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
    </div>
  )
}
