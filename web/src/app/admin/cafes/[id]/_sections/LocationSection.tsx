"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  cafeId: string
  initial: {
    address: string | null
    postalCode: string | null
    lat: number | null
    lng: number | null
    sourceUrl: string | null
  }
}

export function LocationSection({ cafeId, initial }: Props) {
  const [form, setForm] = useState({
    address: initial.address ?? "",
    postalCode: initial.postalCode ?? "",
    lat: initial.lat?.toString() ?? "",
    lng: initial.lng?.toString() ?? "",
    sourceUrl: initial.sourceUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, {
      address: form.address || null,
      postalCode: form.postalCode || null,
      lat: form.lat ? parseFloat(form.lat) || null : null,
      lng: form.lng ? parseFloat(form.lng) || null : null,
      sourceUrl: form.sourceUrl || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Lokalizacja" hint="Adres i współrzędne geograficzne" />

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

      <Field label="Źródłowy URL (skąd pochodzi wpis)">
        <input
          value={form.sourceUrl}
          onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
