"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  VERIFIED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-900",
}

interface Props {
  cafeId: string
  initial: {
    featured: boolean
    ownerId: string | null
    status: string
  }
}

export function AdminSection({ cafeId, initial }: Props) {
  const [form, setForm] = useState({
    featured: initial.featured,
    ownerId: initial.ownerId ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, {
      featured: form.featured,
      ownerId: form.ownerId || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      <Field label="ID właściciela (ownerId)">
        <input
          value={form.ownerId}
          onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
          className={adminInput}
        />
        <Hint>Puste = propozycja bez właściciela. Wklej Clerk user ID.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
