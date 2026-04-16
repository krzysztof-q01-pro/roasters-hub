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
  }
}

export function LocationSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    address: initial.address ?? "",
    postalCode: initial.postalCode ?? "",
    lat: initial.lat?.toString() ?? "",
    lng: initial.lng?.toString() ?? "",
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
      <SectionHeader title="Lokalizacja" hint="Adres i współrzędne geograficzne palarni" />

      <Field label="Adres">
        <input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <Field label="Kod pocztowy">
        <input
          value={form.postalCode}
          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Szerokość geograficzna (lat)">
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
            className={adminInput}
          />
        </Field>

        <Field label="Długość geograficzna (lng)">
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
            className={adminInput}
          />
        </Field>
      </div>
      <Hint>
        Współrzędne możesz znaleźć w Google Maps: kliknij prawym przyciskiem na lokalizację i skopiuj
        wartości lat/lng.
      </Hint>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
