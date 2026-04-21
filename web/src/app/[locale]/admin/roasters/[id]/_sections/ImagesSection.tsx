"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    coverImageUrl: string | null
  }
}

export function ImagesSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    coverImageUrl: initial.coverImageUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      coverImageUrl: form.coverImageUrl || null,
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
      <SectionHeader title="Images" hint="Cover image URL for the roastery" />

      <Field label="Cover image URL">
        <input
          value={form.coverImageUrl}
          onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
          placeholder="https://…"
          className={adminInput}
        />
        <Hint>Upload via UploadThing and paste the URL here.</Hint>
        {form.coverImageUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImageUrl}
              alt="Cover preview"
              className="h-32 w-full max-w-xs rounded-lg object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          </div>
        )}
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
    </div>
  )
}
