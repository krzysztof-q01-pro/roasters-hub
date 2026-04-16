"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { SectionHeader, Field, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    wholesaleAvailable: boolean | null
    subscriptionAvailable: boolean | null
    hasCafe: boolean | null
    hasTastingRoom: boolean | null
  }
}

function NullableCheckbox({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5">
      <input
        type="checkbox"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked ? true : null)}
        className="accent-[var(--color-accent)] mt-0.5 h-4 w-4 shrink-0"
      />
      <div>
        <p className="text-gray-200 font-medium">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </label>
  )
}

export function OfferSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    wholesaleAvailable: initial.wholesaleAvailable,
    subscriptionAvailable: initial.subscriptionAvailable,
    hasCafe: initial.hasCafe,
    hasTastingRoom: initial.hasTastingRoom,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      wholesaleAvailable: form.wholesaleAvailable,
      subscriptionAvailable: form.subscriptionAvailable,
      hasCafe: form.hasCafe,
      hasTastingRoom: form.hasTastingRoom,
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
      <SectionHeader title="Oferta" hint="Usługi i możliwości palarni" />

      <Field label="Dostępne opcje">
        <div className="flex flex-col gap-1">
          <NullableCheckbox
            label="Hurtownia / dostawa B2B"
            description="Palarnia oferuje sprzedaż hurtową dla kawiarni i restauracji"
            value={form.wholesaleAvailable}
            onChange={(v) => setForm((f) => ({ ...f, wholesaleAvailable: v }))}
          />
          <NullableCheckbox
            label="Subskrypcja kawy"
            description="Możliwość zamawiania kawy w abonamencie"
            value={form.subscriptionAvailable}
            onChange={(v) => setForm((f) => ({ ...f, subscriptionAvailable: v }))}
          />
          <NullableCheckbox
            label="Prowadzi kawiarnię"
            description="Palarnia posiada własną kawiarnię lub punkt sprzedaży"
            value={form.hasCafe}
            onChange={(v) => setForm((f) => ({ ...f, hasCafe: v }))}
          />
          <NullableCheckbox
            label="Sala degustacyjna / tasting room"
            description="Możliwość degustacji kaw w siedzibie palarni"
            value={form.hasTastingRoom}
            onChange={(v) => setForm((f) => ({ ...f, hasTastingRoom: v }))}
          />
        </div>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
