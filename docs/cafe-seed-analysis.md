# Cafe Seed Data Analysis

## Source
**Website:** europeancoffeetrip.com  
**Scraped:** 2026-03-31  
**Cities:** Munich, Warsaw, Berlin, Poznan  
**Total cafes:** 94

---

## Summary

We successfully scraped **94 specialty coffee cafes** from European Coffee Trip across 4 European cities. The data provides a solid foundation for testing the cafe discovery UX in BeenMap.

### Distribution by City
| City | Count |
|------|-------|
| Munich | 19 |
| Warsaw | 25 |
| Berlin | 25 |
| Poznan | 25 |

---

## Attributes Found

### Successfully Extracted (High Confidence)

| Attribute | Coverage | Notes |
|-----------|----------|-------|
| `name` | 100% (94/94) | Cafe name extracted from page title |
| `slug` | 100% (94/94) | Auto-generated from name + city |
| `city` | 100% (94/94) | From search parameter |
| `country` | 100% (94/94) | Mapped from city |
| `countryCode` | 100% (94/94) | ISO code mapped from country |
| `source_url` | 100% (94/94) | Original European Coffee Trip URL |
| `description` | 99% (93/94) | Meta description or excerpt |

### Not Extracted (Needs Improvement)

| Attribute | Coverage | Issue |
|-----------|----------|-------|
| `instagram` | 0% | Extracted site's account instead of cafe's |
| `website` | 0% | Not found on listing pages |
| `phone` | 0% | Notfound on listing pages |
| `address` | 0% | Requires detail page scraping |
| `lat/lng` | 0% | Requires geocoding after address extraction |
| `logoUrl` | 0% | Images not extracted |
| `coverImageUrl` | 0% | Images not extracted |

---

## Recommended Schema Enhancements

Based on the European Coffee Trip data structure, consider adding:

### Additional Fields (Optional)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `roastersServed` | String[] | Which roasters the cafe serves | Detail page |
| `openingHours` | String | Opening hours | Detail page |
| `priceLevel` | String | €, €€, €€€ | Detail page |
| `hasWifi` | Boolean | WiFi availability | Detail page |
| `hasOutdoorSeating` | Boolean | Outdoor seating | Detail page |
| `servesFood` | Boolean | Food menu | Detail page |
| `servesAlcohol` | Boolean | Alcohol menu | Detail page |
| `acceptsCardPayment` | Boolean | Card payment | Detail page |
| `instagramHandle` | String | Instagram @handle | Detail page |
| `facebookHandle` | String | Facebook page | Detail page |

---

## Data Quality Notes

### Strengths
1. **Verified source** - European Coffee Trip is a respected specialty coffee guide
2. **Consistent naming** - All cafe names are properly formatted
3. **City/country coverage** - Good distribution across 4 major cities
4. **Slug generation** - Unique slugs created for database

### Limitations
1. **No addresses** - Would require deeper scraping of detail pages
2. **No coordinates** - Geocoding needed after address extraction
3. **No contact info** - Phone, website, Instagram missing
4. **No images** - Logo and cover images not extracted
5. **No roaster relations** - Which roasters each cafe serves

---

## Next Steps

### Immediate (Seed File Ready)
1. ✅ Seed file created at `web/prisma/seed_cafes.ts`
2. ✅ 94 cafes ready for database seeding
3. ✅ Slugs are unique and URL-safe

### Follow-up (Manual Enrichment)
1. **Geocoding** - Run geocoding script to add lat/lng for each cafe
2. **Contact info** - Manually add websites and social media for featured cafes
3. **Images** - Source logo and cover images from cafe websites
4. **Addresses** - Add addresses for core cafes in each city

### Future Automation
1. Improve scraper to navigate to detail pages
2. Extract Instagram handles from social links
3. Parse opening hours from detail pages
4. Geocode addresses automatically

---

## File Locations

| File | Purpose |
|------|---------|
| `web/prisma/seed_cafes.ts` | TypeScript seed file for Prisma |
| `.tmp/cafes_seed_final.json` | Raw JSON data |
| `.tmp/cafes_raw_munich.json` | Per-city raw data |
| `.tmp/cafes_raw_warsaw.json` | Per-city raw data |
| `.tmp/cafes_raw_berlin.json` | Per-city raw data |
| `.tmp/cafes_raw_poznan.json` | Per-city raw data |
| `tools/scrape_cafes_final.ts` | Scraper script |

---

## Usage

To seed the database with cafes:

```bash
cd web
npx prisma db seed
```

Or run the seed script directly:

```bash
npx tsx prisma/seed_cafes.ts
```

---

## Comparison: Roasters vs Cafes Schema

| Field | Roasters | Cafes | Notes |
|-------|----------|-------|-------|
| `name` | ✅ | ✅ | Same |
| `slug` | ✅ | ✅ | Same |
| `description` | ✅ | ✅ | Same |
| `country` | ✅ | ✅ | Same |
| `countryCode` | ✅ | ✅ | Same |
| `city` | ✅ | ✅ | Same |
| `address` | ❌ | ✅ | Cafes have address |
| `lat/lng` | ✅ | ✅ | Same |
| `website` | ✅ | ✅ | Same |
| `email` | ✅ | ❌ | Cafes don't list email |
| `instagram` | ✅ | ✅ | Same |
| `facebook` | ✅ | ✅ | Same |
| `phone` | ❌ | ✅ | Cafes have phone |
| `logoUrl` | ✅ | ✅ | Same concept |
| `coverImageUrl` | ❌ | ✅ | Cafes have cover |
| `certifications` | ✅ | ❌ | Roaster-specific |
| `origins` | ✅ | ❌ | Roaster-specific |
| `roastStyles` | ✅ | ❌ | Roaster-specific |
| `roastersServed` | ❌ | 🔜 | New field for cafes |
| `shopUrl` | ✅ | ❌ | Roaster-specific |
| `status` | ✅ | ✅ | Same |
| `featured` | ✅ | ✅ | Same |

---

*Generated: 2026-03-31*