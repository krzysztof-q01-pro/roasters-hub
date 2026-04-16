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
      setSaveError(result.error ?? "Błąd zapisu")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Kontakt" hint="Strony internetowe, sklep i media społecznościowe" />

      <Field label="Strona www">
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          placeholder="https://"
          className={adminInput}
        />
      </Field>

      <Field label="Sklep online (shopUrl)">
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
          placeholder="@nazwa_konta"
          className={adminInput}
        />
        <Hint>Wpisz z prefiksem @, np. @roasters_hub</Hint>
      </Field>

      <Field label="Facebook">
        <input
          value={form.facebook}
          onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))}
          placeholder="https://facebook.com/…"
          className={adminInput}
        />
      </Field>

      <Field label="Telefon">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={adminInput}
        />
      </Field>

      <Field label="E-mail">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={adminInput}
        />
        <Hint>Adres e-mail nie jest publikowany na stronie palarni.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
