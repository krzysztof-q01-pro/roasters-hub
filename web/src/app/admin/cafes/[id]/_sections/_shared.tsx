import React from "react"

export const adminInput =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-40"

export function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-b border-white/10 pb-3 mb-5">
      <h2 className="text-base font-semibold text-gray-100">{title}</h2>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
}

export function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-accent)]">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-gray-600">{children}</p>
}

export function SaveButton({
  saving,
  saved,
  onClick,
}: {
  saving: boolean
  saved: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="self-start rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {saving ? "Zapisywanie…" : saved ? "✓ Zapisano" : "Zapisz sekcję"}
    </button>
  )
}
