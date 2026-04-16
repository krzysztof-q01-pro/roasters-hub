"use client"

import { useState, KeyboardEvent } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { CAFE_SERVICES } from "@/constants/cafe-services"
import { adminInput, SectionHeader, Field, Hint, SaveButton } from "./_shared"

interface Props {
  cafeId: string
  initial: {
    serving: string[]
    services: string[]
  }
}

// Group CAFE_SERVICES by group label
const SERVICE_GROUPS = Array.from(
  CAFE_SERVICES.reduce((map, svc) => {
    if (!map.has(svc.group)) map.set(svc.group, [])
    map.get(svc.group)!.push(svc)
    return map
  }, new Map<string, (typeof CAFE_SERVICES)[number][]>()),
)

export function ServicesSection({ cafeId, initial }: Props) {
  const [serving, setServing] = useState<string[]>(initial.serving)
  const [servingInput, setServingInput] = useState("")
  const [services, setServices] = useState<string[]>(initial.services)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addServing() {
    const val = servingInput.trim()
    if (!val || serving.includes(val)) return
    setServing((prev) => [...prev, val])
    setServingInput("")
  }

  function removeServing(tag: string) {
    setServing((prev) => prev.filter((s) => s !== tag))
  }

  function onServingKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addServing()
    }
  }

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    )
  }

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, { serving, services })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Oferta i usługi"
        hint="Jakie kawy serwuje kawiarnia i jakie usługi oferuje"
      />

      <Field label="Serwowane kawy (tagi)">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {serving.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeServing(tag)}
                className="text-gray-500 hover:text-gray-200 leading-none"
                aria-label={`Usuń ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={servingInput}
            onChange={(e) => setServingInput(e.target.value)}
            onKeyDown={onServingKeyDown}
            placeholder="Wpisz i naciśnij Enter…"
            className={adminInput}
          />
          <button
            type="button"
            onClick={addServing}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/20"
          >
            Dodaj
          </button>
        </div>
        <Hint>Np. espresso, filter, pour-over — naciśnij Enter po każdym tagu</Hint>
      </Field>

      <Field label="Usługi i udogodnienia">
        <div className="flex flex-col gap-4">
          {SERVICE_GROUPS.map(([group, items]) => (
            <div key={group}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((svc) => (
                  <label
                    key={svc.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(svc.value)}
                      onChange={() => toggleService(svc.value)}
                      className="accent-[var(--color-accent)] h-4 w-4"
                    />
                    {svc.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Field>

      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
