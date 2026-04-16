"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  VERIFIED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-900",
  INACTIVE: "bg-gray-100 text-gray-800",
}

interface Props {
  roasterId: string
  initial: {
    featured: boolean
    featuredUntil: string | null
    ownerId: string | null
    status: string
  }
}

export function AdminSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    featured: initial.featured,
    featuredUntil: initial.featuredUntil
      ? new Date(initial.featuredUntil).toISOString().slice(0, 10)
      : "",
    ownerId: initial.ownerId ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      featured: form.featured,
      featuredUntil: form.featuredUntil ? new Date(form.featuredUntil) : null,
      ownerId: form.ownerId || null,
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
      <SectionHeader title="Admin" hint="Ustawienia administracyjne i właściciel" />

      <Field label="Status (tylko do odczytu — zmień przez przyciski w toolbarze)">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLORS[initial.status] ?? "bg-gray-100 text-gray-800"}`}
          >
            {initial.status}
          </span>
        </div>
      </Field>

      <Field label="Wyróżnione">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            className="accent-[var(--color-accent)] h-4 w-4"
          />
          Wyróżnione na liście
        </label>
      </Field>

      <Field label="Wyróżnione do (featuredUntil)">
        <input
          type="date"
          value={form.featuredUntil}
          onChange={(e) => setForm((f) => ({ ...f, featuredUntil: e.target.value }))}
          className={adminInput}
        />
        <Hint>Puste = wyróżnione bezterminowo (jeśli wyróżnione jest zaznaczone).</Hint>
      </Field>

      <Field label="ID właściciela (ownerId)">
        <input
          value={form.ownerId}
          onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
          className={adminInput}
        />
        <Hint>Puste = propozycja bez właściciela. Wklej Clerk user ID.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
