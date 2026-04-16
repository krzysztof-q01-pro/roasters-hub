"use client"

import { useState } from "react"
import { adminUpdateRoaster } from "@/actions/admin.actions"
import { OpeningHoursPicker } from "@/components/shared/OpeningHoursPicker"
import { OpeningHours, EMPTY_OPENING_HOURS } from "@/types/opening-hours"
import { Prisma } from "@prisma/client"
import { SectionHeader, SaveButton } from "./_shared"

interface Props {
  roasterId: string
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

export function HoursSection({ roasterId, initialHours }: Props) {
  const [hours, setHours] = useState<OpeningHours>(() => parseOpeningHours(initialHours))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const result = await adminUpdateRoaster(roasterId, { openingHours: hours as unknown as Prisma.InputJsonValue })
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
      <SectionHeader title="Godziny otwarcia" hint="Ustaw godziny dla każdego dnia tygodnia" />
      <OpeningHoursPicker value={hours} onChange={setHours} />
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      {saveError && (
        <p className="text-sm text-red-400">{saveError}</p>
      )}
    </div>
  )
}
