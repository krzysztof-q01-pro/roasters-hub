"use client"

import { ALL_DAYS, DAY_LABELS, OpeningHours, TIME_OPTIONS, WEEKDAYS, Day } from "@/types/opening-hours"

interface Props {
  value: OpeningHours
  onChange: (value: OpeningHours) => void
}

const DEFAULT_OPEN = "08:00"
const DEFAULT_CLOSE = "18:00"

export function OpeningHoursPicker({ value, onChange }: Props) {
  function handleToggle(day: Day, checked: boolean) {
    if (checked) {
      const hours = { open: DEFAULT_OPEN, close: DEFAULT_CLOSE }
      const next = { ...value, [day]: hours }
      // Smart Monday: toggling Mon open propagates to Tue-Fri
      if (day === "mon") {
        WEEKDAYS.forEach((d) => {
          if (d !== "mon") next[d] = { ...hours }
        })
      }
      onChange(next)
    } else {
      onChange({ ...value, [day]: null })
    }
  }

  function handleTimeChange(
    day: Day,
    field: "open" | "close",
    time: string
  ) {
    const existing = value[day]
    if (!existing) return
    onChange({ ...value, [day]: { ...existing, [field]: time } })
  }

  function copyMonToWeekdays() {
    const monHours = value.mon
    if (!monHours) return
    const next = { ...value }
    WEEKDAYS.forEach((d) => {
      if (d !== "mon") next[d] = { ...monHours }
    })
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      {ALL_DAYS.map((day) => {
        const hours = value[day]
        const isOpen = hours !== null
        return (
          <div
            key={day}
            className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
              isOpen
                ? "bg-[var(--color-surface-container-low)]"
                : "bg-transparent opacity-60"
            }`}
          >
            <input
              type="checkbox"
              id={`day-${day}`}
              checked={isOpen}
              onChange={(e) => handleToggle(day, e.target.checked)}
              className="accent-[var(--color-primary)] h-4 w-4 cursor-pointer"
            />
            <label
              htmlFor={`day-${day}`}
              className="w-8 cursor-pointer select-none text-sm font-medium text-[var(--color-on-surface)]"
            >
              {DAY_LABELS[day]}
            </label>

            {isOpen ? (
              <>
                <select
                  value={hours.open}
                  onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                  className="rounded border border-[var(--color-outline-variant)] bg-white px-2 py-1 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-[var(--color-outline)]">—</span>
                <select
                  value={hours.close}
                  onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                  className="rounded border border-[var(--color-outline-variant)] bg-white px-2 py-1 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </>
            ) : (
              <span className="text-sm italic text-[var(--color-outline)]">Closed</span>
            )}
          </div>
        )
      })}

      {value.mon !== null && (
        <button
          type="button"
          onClick={copyMonToWeekdays}
          className="mt-1 self-start rounded px-2 py-1 text-xs text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors"
        >
          Copy Mon–Fri hours to all weekdays
        </button>
      )}
    </div>
  )
}
