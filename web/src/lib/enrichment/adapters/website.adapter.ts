// web/src/lib/enrichment/adapters/website.adapter.ts

import type { SourceAdapter, DiscoveryQuery, KnownPlace, RawPlace } from './base'
import type { EntityType } from '../schemas/types'

const USER_AGENT = 'BeanMapBot/1.0 (+https://beanmap.coffee/bot)'
const RATE_LIMIT_MS = 1500
const FETCH_TIMEOUT_MS = 8000

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url)
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`
    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return true // No robots.txt = allowed

    const text = await res.text()
    const lines = text.split('\n').map((l) => l.trim())
    let applicable = false

    for (const line of lines) {
      if (/^user-agent:\s*(\*|beanmapbot)/i.test(line)) {
        applicable = true
      }
      if (applicable && /^disallow:\s*\//i.test(line)) {
        return false
      }
      if (applicable && /^user-agent:/i.test(line) && !/^user-agent:\s*(\*|beanmapbot)/i.test(line)) {
        applicable = false
      }
    }
    return true
  } catch {
    return true
  }
}

function extractPhone(html: string): string | undefined {
  // 1. Try tel: link (most reliable source)
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i)
  if (telMatch) {
    const cleaned = decodeURIComponent(telMatch[1]).replace(/[^\d+]/g, '').trim()
    if (cleaned.length >= 7) return cleaned
  }

  // 2. Fallback: scan text for phone-like patterns
  // Match: optional +country code, then digits with common separators
  const phonePattern = /(?:\+?\d{1,3}[-.\s()]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
  const matches = html.match(phonePattern)
  if (matches) {
    for (const match of matches) {
      const trimmed = match.trim()
      const digitsOnly = trimmed.replace(/\D/g, '')

      // Must have 7-15 digits (valid phone length)
      if (digitsOnly.length < 7 || digitsOnly.length > 15) continue

      // Reject version numbers like "1.15.0" or "1.15045.0"
      if (/^\d+\.\d+\.\d+$/.test(trimmed)) continue

      // Reject dates like "2024-04-24" or "24.04.2024"
      if (/^\d{4}[-./]\d{2}[-./]\d{2}$/.test(trimmed)) continue
      if (/^\d{2}[-./]\d{2}[-./]\d{4}$/.test(trimmed)) continue

      // Reject if mostly dots (likely not a phone)
      const dotCount = (trimmed.match(/\./g) || []).length
      if (dotCount >= 2 && digitsOnly.length < 9) continue

      return trimmed
    }
  }
  return undefined
}

function extractEmail(html: string): string | undefined {
  const mailtoMatch = html.match(/href="mailto:([^"?]+)"/i)
  if (mailtoMatch) return mailtoMatch[1].trim()
  return undefined
}

function extractInstagram(html: string): string | undefined {
  const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/i)
  if (igMatch && igMatch[1] !== 'p' && igMatch[1] !== 'reel') {
    return igMatch[1]
  }
  return undefined
}

function extractDescription(html: string): string | undefined {
  const metaMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]{20,500})"/i)
  if (metaMatch) return metaMatch[1].trim()

  const ogMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]{20,500})"/i)
  if (ogMatch) return ogMatch[1].trim()

  return undefined
}

function extractOpeningHours(html: string): string | undefined {
  const ohMatch = html.match(
    /(?:opening.?hours?|godziny|öffnungszeiten)[^<]{0,200}?(\d{1,2}[:h]\d{2}|\d{1,2}\s*[-–]\s*\d{1,2})/i,
  )
  return ohMatch ? ohMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 200) : undefined
}

export class WebsiteAdapter implements SourceAdapter {
  id = 'website'
  name = 'Own Website'
  supports: EntityType[] = ['CAFE', 'ROASTER']
  reliability = 0.9
  requiresConsent = false

  private lastRequestAt = 0

  private async fetchHtml(url: string): Promise<string | null> {
    const now = Date.now()
    const elapsed = now - this.lastRequestAt
    if (elapsed < RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed))
    }
    this.lastRequestAt = Date.now()

    try {
      const allowed = await isAllowedByRobots(url)
      if (!allowed) {
        console.warn(`[WebsiteAdapter] robots.txt disallows scraping: ${url}`)
        return null
      }

      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!res.ok) return null
      return res.text()
    } catch {
      return null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async discover(_query: DiscoveryQuery): Promise<RawPlace[]> {
    // Website adapter cannot discover new places — it enriches known ones
    return []
  }

  async enrich(place: KnownPlace): Promise<RawPlace> {
    if (!place.website) {
      return { sourceId: `website:${place.id}`, fields: {} }
    }

    const html = await this.fetchHtml(place.website)
    if (!html) {
      return { sourceId: `website:${place.id}`, fields: {} }
    }

    const fields: Record<string, unknown> = {
      _existingId: place.id,
    }

    const phone = extractPhone(html)
    if (phone) fields['phone'] = phone

    const email = extractEmail(html)
    if (email) fields['email'] = email

    const instagram = extractInstagram(html)
    if (instagram) fields['instagram'] = instagram

    const description = extractDescription(html)
    if (description) fields['description'] = description

    const openingHours = extractOpeningHours(html)
    if (openingHours) fields['openingHours'] = openingHours

    return {
      sourceId: `website:${place.id}`,
      fields,
      sourceUrl: place.website,
    }
  }
}
