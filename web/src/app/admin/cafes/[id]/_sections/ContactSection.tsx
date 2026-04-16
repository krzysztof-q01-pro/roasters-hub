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

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, {
      website: form.website || null,
      instagram: form.instagram || null,
      phone: form.phone || null,
      email: form.email || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Kontakt" hint="Dane kontaktowe i media społecznościowe" />

      <Field label="Strona www">
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
          placeholder="@nazwa_konta"
          className={adminInput}
        />
        <Hint>Wpisz z prefiksem @, np. @roasters_hub</Hint>
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
        <Hint>Adres e-mail nie jest publikowany na stronie kawiarni.</Hint>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
