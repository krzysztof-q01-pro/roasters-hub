"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  cafeId: string
  initial: {
    coverImageUrl: string | null
    logoUrl: string | null
  }
}

export function ImagesSection({ cafeId, initial }: Props) {
  const [form, setForm] = useState({
    coverImageUrl: initial.coverImageUrl ?? "",
    logoUrl: initial.logoUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateCafe(cafeId, {
      coverImageUrl: form.coverImageUrl || null,
      logoUrl: form.logoUrl || null,
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
      <SectionHeader title="Zdjęcia" hint="URL zdjęcia głównego i logo kawiarni" />

      <Field label="URL zdjęcia głównego (cover)">
        <input
          value={form.coverImageUrl}
          onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
          placeholder="https://…"
          className={adminInput}
        />
        <Hint>Wgraj zdjęcie przez UploadThing i wklej URL tutaj.</Hint>
        {form.coverImageUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImageUrl}
              alt="Podgląd cover"
              className="h-32 w-full max-w-xs rounded-lg object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          </div>
        )}
      </Field>

      <Field label="URL logo">
        <input
          value={form.logoUrl}
          onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          placeholder="https://…"
          className={adminInput}
        />
        <Hint>Wgraj logo przez UploadThing i wklej URL tutaj.</Hint>
        {form.logoUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logoUrl}
              alt="Podgląd logo"
              className="h-20 w-20 rounded-lg object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          </div>
        )}
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
