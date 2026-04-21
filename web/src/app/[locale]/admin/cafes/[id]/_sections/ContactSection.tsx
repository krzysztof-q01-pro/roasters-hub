"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  cafeId: string
  initial: {
    website: string | null
    instagram: string | null
    phone: string | null
    email: string | null
  }
}

export function ContactSection({ cafeId, initial }: Props) {
  const [form, setForm] = useState({
    website: initial.website ?? "",
    instagram: initial.instagram ?? "",
    phone: initial.phone ?? "",
    email: initial.email ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateCafe(cafeId, {
      website: form.website || null,
      instagram: form.instagram || null,
      phone: form.phone || null,
      email: form.email || null,
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
      <SectionHeader title="Contact" hint="Website, social media, and contact details" />

      <Field label="Website">
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          placeholder="https://"
          className={adminInput}
        />
      </Field>

      <Field label="Instagram">
        <input
          value={form.instagram}
          onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
          placeholder="@handle"
          className={adminInput}
        />
        <Hint>Include the @ prefix, e.g. @roasters_hub</Hint>
      </Field>

      <Field label="Phone">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+48 123 456 789"
          className={adminInput}
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="hello@example.com"
          className={adminInput}
        />
        <Hint>Email address is not published on the cafe&apos;s public page.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
    </div>
  )
}
