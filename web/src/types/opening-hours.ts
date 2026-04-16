export type DayHours = { open: string; close: string } | null

export type OpeningHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const
export const ALL_DAYS = [
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
] as const
export type Day = (typeof ALL_DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
}

export const EMPTY_OPENING_HOURS: OpeningHours = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
}

/** 06:00 to 23:45 in 15-minute increments */
export function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 23 && m > 45) break
      times.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      )
    }
  }
  return times
}

export const TIME_OPTIONS = generateTimeOptions()
