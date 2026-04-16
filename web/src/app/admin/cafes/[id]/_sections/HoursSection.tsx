"use client"

import { useState } from "react"
import { adminUpdateCafe } from "@/actions/cafe.actions"
import { OpeningHoursPicker } from "@/components/shared/OpeningHoursPicker"
import { OpeningHours, EMPTY_OPENING_HOURS } from "@/types/opening-hours"
import { Prisma } from "@prisma/client"
import { SectionHeader, SaveButton } from "./_shared"

interface Props {
  cafeId: string
  initialHours: Prisma.JsonValue | null
}

function parseOpeningHours(raw: Prisma.JsonValue | null): OpeningHours {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_OPENING_HOURS
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
  const result: OpeningHours = { ...EMPTY_OPENING_HOURS }
  for (const day of days) {
    const val = (raw as Record<string, unknown>)[day]
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof (val as Record<string, unknown>).open === "string" &&
      typeof (val as Record<string, unknown>).close === "string"
    ) {
      result[day] = {
        open: (val as Record<string, string>).open,
        close: (val as Record<string, string>).close,
      }
    } else {
      result[day] = null
    }
  }
  return result
}

export function HoursSection({ cafeId, initialHours }: Props) {
  const [hours, setHours] = useState<OpeningHours>(() => parseOpeningHours(initialHours))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await adminUpdateCafe(cafeId, { openingHours: hours as unknown as Prisma.InputJsonValue })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Godziny otwarcia" hint="Ustaw godziny dla każdego dnia tygodnia" />
      <OpeningHoursPicker value={hours} onChange={setHours} />
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </div>
  )
}
