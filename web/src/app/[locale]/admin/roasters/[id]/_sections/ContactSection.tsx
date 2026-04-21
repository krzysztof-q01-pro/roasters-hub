"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  roasterId: string
  initial: {
    website: string | null
    shopUrl: string | null
    instagram: string | null
    facebook: string | null
    phone: string | null
    email: string | null
  }
}

export function ContactSection({ roasterId, initial }: Props) {
  const [form, setForm] = useState({
    website: initial.website ?? "",
    shopUrl: initial.shopUrl ?? "",
    instagram: initial.instagram ?? "",
    facebook: initial.facebook ?? "",
    phone: initial.phone ?? "",
    email: initial.email ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, {
      website: form.website || null,
      shopUrl: form.shopUrl || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
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
      <SectionHeader title="Contact" hint="Website, online shop, and social media" />

      <Field label="Website">
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          placeholder="https://"
          className={adminInput}
        />
      </Field>

      <Field label="Online shop">
        <input
          type="url"
          value={form.shopUrl}
          onChange={(e) => setForm((f) => ({ ...f, shopUrl: e.target.value }))}
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

      <Field label="Facebook">
        <input
          value={form.facebook}
          onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))}
          placeholder="https://facebook.com/…"
          className={adminInput}
        />
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
        <Hint>Email address is not published on the roastery&apos;s public page.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}
    </div>
  )
}
