"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { upsertEnrichmentTag, deleteEnrichmentTag } from "@/app/admin/enrichment/actions/tags"

const SOURCES = [
  { id: "osm", label: "OSM (OpenStreetMap)" },
  { id: "ect", label: "ECT (Ethical Coffee Trade)", requiresConsent: true },
  { id: "website", label: "Website scraper" },
]

export function NewRunForm() {
  const router = useRouter()
  const [entityType, setEntityType] = useState<"CAFE" | "ROASTER">("ROASTER")
  const [mode, setMode] = useState<"discover" | "enrich" | "both">("enrich")
  const [sources, setSources] = useState<string[]>(["osm"])
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [limit, setLimit] = useState(20)
  const [consent, setConsent] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ectSelected = sources.includes("ect")

  useEffect(() => {
    fetch(`/api/enrichment/tags?entityType=${entityType}`)
      .then((r) => r.json())
      .then((data: { tags: string[] }) => setKeywords(data.tags))
      .catch(() => {})
  }, [entityType])

  async function addKeyword(value: string) {
    const trimmed = value.trim()
    if (!trimmed || keywords.includes(trimmed)) return
    setKeywords((prev) => [...prev, trimmed])
    setKeywordInput("")
    await upsertEnrichmentTag(entityType, trimmed)
  }

  async function removeKeyword(value: string) {
    setKeywords((prev) => prev.filter((k) => k !== value))
    await deleteEnrichmentTag(entityType, value)
  }

  function toggleSource(id: string) {
    setSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (sources.length === 0) {
      setError("Select at least one source.")
      return
    }
    if (ectSelected && !consent) {
      setError("Consent required to use ECT data.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/enrichment/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          mode,
          sources,
          country: country || undefined,
          city: city || undefined,
          limit,
          consent: ectSelected ? consent : undefined,
          keywords,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const { runId } = await res.json()
      router.push(`/admin/enrichment/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Entity type */}
      <fieldset>
        <legend className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">Entity type</legend>
        <div className="flex gap-3">
          {(["ROASTER", "CAFE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEntityType(t)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                entityType === t
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Mode */}
      <fieldset>
        <legend className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">Mode</legend>
        <div className="flex gap-3">
          {(["discover", "enrich", "both"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all capitalize ${
                mode === m
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-on-surface-variant">
          {mode === "discover" && "Find new entities from external sources."}
          {mode === "enrich" && "Update existing verified entities with new data."}
          {mode === "both" && "Discover new entities and enrich existing ones."}
        </p>
      </fieldset>

      {/* Sources */}
      <fieldset>
        <legend className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">Sources</legend>
        <div className="space-y-2">
          {SOURCES.map((s) => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sources.includes(s.id)}
                onChange={() => toggleSource(s.id)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-background">{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Keywords / Tags */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500">
          Keywords / Tagi specialty
        </label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2 min-h-[42px]">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1 rounded-full bg-amber-800 px-3 py-1 text-xs font-semibold text-white"
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="ml-1 opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addKeyword(keywordInput); }
              if (e.key === ",") { e.preventDefault(); addKeyword(keywordInput); }
            }}
            placeholder="Dodaj tag…"
            className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-stone-300"
          />
        </div>
        <p className="text-xs text-stone-400">
          Filtruje wyniki OSM · używane jako query Unsplash przy losowaniu zdjęć
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block mb-1.5">Country (optional)</span>
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="e.g. PL"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block mb-1.5">City (optional)</span>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Warsaw"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:border-primary"
          />
        </label>
      </div>

      {/* Limit */}
      <label className="block">
        <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block mb-1.5">Limit (entities to process)</span>
        <input
          type="number"
          value={limit}
          min={1}
          max={500}
          onChange={e => setLimit(Number(e.target.value))}
          className="w-32 px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:border-primary"
        />
      </label>

      {/* ECT consent */}
      {ectSelected && (
        <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
          />
          <span className="text-sm text-amber-900">
            I consent to use ECT (Ethical Coffee Trade) data in this enrichment run. ECT requires explicit consent for each use.
          </span>
        </label>
      )}

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Starting run…" : "Start run →"}
        </button>
        <Link href="/admin/enrichment" className="px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  )
}
