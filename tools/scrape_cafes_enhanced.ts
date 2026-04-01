#!/usr/bin/env node
/**
 * Enhanced ECT cafe scraper with detail page extraction
 * Usage: npx tsx tools/scrape_cafes_enhanced.ts [--city=Munich --limit=5]
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://europeancoffeetrip.com';

const CITY_COUNTRY_MAP: Record<string, [string, string]> = {
  Munich: ['Germany', 'DE'],
  Warsaw: ['Poland', 'PL'],
  Berlin: ['Germany', 'DE'],
  Poznan: ['Poland', 'PL'],
};

interface CafeData {
  name: string;
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  address?: string;
  lat?: number;
  lng?: number;
  website?: string;
  instagram?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
  openingHours?: string;
  serving?: string[];
  services?: string[];
  sourceUrl: string;
}

function generateSlug(name: string, city: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + city.toLowerCase();
}

async function waitForCloudflare(page: any, timeout: number = 15000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const title = await page.title();
    if (!title.includes('Just a moment') && !title.includes('Attention Required')) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BeenMap/1.0 (https://beanmap.app)' }
    });
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.log(`    Geocoding failed: ${(e as Error).message}`);
  }
  return null;
}

async function scrapeCafeDetail(page: any, url: string): Promise<Partial<CafeData> | null> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForCloudflare(page, 10000);
    await page.waitForTimeout(1500);
    
    const result: Partial<CafeData> = {};
    
    // Extract name from h1 or title
    try {
      const h1 = await page.locator('h1').first().innerText();
      result.name = h1.trim().replace(/\s*\|.*/g, '').slice(0, 100);
    } catch (e) {}
    
    // Extract address from body text (pattern: street + postal + city)
    try {
      const bodyText = await page.locator('body').innerText();
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Look for line containing street + postal code + city
      for (const line of lines) {
        // German: "Straße 12, 12345 Berlin" or "Straße 12, 12345 Berlin, Germany"
        // Must have: street name + number + postal code + city
        if (line.match(/straße|str\./i) && line.match(/\d{4,5}/) && line.length < 120 && line.length > 10) {
          // Clean up: remove trailing country
          let addr = line.replace(/,\s*(Germany|Poland)\s*$/i, '').trim();
          // Remove duplicate words/fragments
          if (!addr.match(/Magazine|Guide|Award/i)) {
            result.address = addr;
            break;
          }
        }
        // Polish: "ul. Street 12, 00-123 Warsaw"
        if (line.match(/ul\.?/i) && line.match(/\d{2,3}-\d{3}/) && line.length < 120) {
          let addr = line.replace(/,\s*(Germany|Poland)\s*$/i, '').trim();
          if (!addr.match(/Magazine|Guide|Award/i)) {
            result.address = addr;
            break;
          }
        }
      }
    } catch (e) {}
    
    // Extract Instagram (not europeancoffeetrip)
    try {
      const igLinks = await page.locator("a[href*='instagram.com']").all();
      for (const link of igLinks) {
        const href = await link.getAttribute('href') || '';
        const match = href.match(/instagram\.com\/([^/?]+)/);
        if (match && match[1] !== 'europeancoffeetrip') {
          result.instagram = match[1].replace(/\/$/, '');
          break;
        }
      }
    } catch (e) {}
    
    // Extract website (not ECT, not social)
    try {
      const links = await page.locator('a[href]').all();
      for (const link of links) {
        const href = await link.getAttribute('href') || '';
        const text = (await link.innerText().catch(() => '')).toLowerCase();
        
        if (!href.includes('europeancoffeetrip') &&
            !href.includes('instagram') &&
            !href.includes('facebook') &&
            !href.includes('twitter') &&
            !href.includes('x.com') &&
            !href.includes('linkedin') &&
            !href.includes('pinterest') &&
            !href.includes('youtube') &&
            href.startsWith('http')) {
          
          if (text.includes('website') || text.includes('visit') || text.includes('order') ||
              href.includes('://www.') || text.match(/^(visit|order|shop)$/i)) {
            result.website = href;
            break;
          }
        }
      }
    } catch (e) {}
    
    // Extract image (og:image or first large image)
    try {
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      if (ogImage && ogImage.includes('europeancoffeetrip.com/wp-content')) {
        result.imageUrl = ogImage;
      }
    } catch (e) {}
    
    // Extract description (meta description)
    try {
      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      if (metaDesc && metaDesc.length > 20 && !metaDesc.includes('European Coffee Trip is a digital magazine')) {
        result.description = metaDesc.slice(0, 500);
      }
    } catch (e) {}
    
    // Extract opening hours (look for "Opening hours" heading followed by schedule)
    try {
      const bodyText = await page.locator('body').innerText();
      const lines = bodyText.split('\n').map(l => l.trim());
      
      let hours: string[] = [];
      let inHours = false;
      for (const line of lines) {
        if (line.match(/^Opening hours$/i)) {
          inHours = true;
          continue;
        }
        if (inHours) {
          // Stop at next section header
          if (line.match(/^(Serving|Services|About|Café|Nearby|Premium|PHOTOS|SHOW)/i)) break;
          // Capture lines like "Monday: 08:30-16:30" or "Closed"
          if (line.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i) || line.match(/^\d{1,2}:\d{2}/)) {
            hours.push(line);
          }
        }
      }
      if (hours.length > 0) {
        result.openingHours = hours.join('\n');
      }
    } catch (e) {}
    
    // Extract serving options
    try {
      const bodyText = await page.locator('body').innerText();
      const lines = bodyText.split('\n').map(l => l.trim());
      
      let serving: string[] = [];
      let inServing = false;
      for (const line of lines) {
        if (line.match(/^Serving$/i)) {
          inServing = true;
          continue;
        }
        if (inServing) {
          if (line.match(/^(Services|About|Café|Nearby|Premium)/i)) break;
          if (line.length > 0 && line.length < 50) {
            serving.push(line);
          }
        }
      }
      if (serving.length > 0) {
        result.serving = serving;
      }
    } catch (e) {}
    
    // Extract services
    try {
      const bodyText = await page.locator('body').innerText();
      const lines = bodyText.split('\n').map(l => l.trim());
      
      let services: string[] = [];
      let inServices = false;
      for (const line of lines) {
        if (line.match(/^Services$/i)) {
          inServices = true;
          continue;
        }
        if (inServices) {
          if (line.match(/^(About|Café|Nearby|Premium)/i)) break;
          if (line.length > 0 && line.length < 50) {
            services.push(line);
          }
        }
      }
      if (services.length > 0) {
        result.services = services;
      }
    } catch (e) {}
    
    return result;
  } catch (e) {
    console.log(`    Error scraping detail: ${(e as Error).message}`);
    return null;
  }
}

async function scrapeCity(city: string, limit: number = 25): Promise<CafeData[]> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`City: ${city}`);
  console.log('='.repeat(50));
  
  const cafes: CafeData[] = [];
  const [country, countryCode] = CITY_COUNTRY_MAP[city] || ['Unknown', 'XX'];
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    // Search page
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(city)}`;
    console.log(`Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await waitForCloudflare(page, 10000);
    await page.waitForTimeout(3000);
    
    // Get cafe links
    const links = await page.locator('a[href*="/cafe/"]').evaluateAll(links => 
      links.map(l => (l as HTMLAnchorElement).href)
        .filter(h => h.includes('/cafe/') && !h.includes('?'))
        .filter((v, i, a) => a.indexOf(v) === i)
    );
    
    console.log(`Found ${links.length} cafe links`);
    const linksToScrape = links.slice(0, limit);
    console.log(`Will scrape ${linksToScrape.length} cafes`);
    
    // Scrape each cafe
    for (let i = 0; i < linksToScrape.length; i++) {
      const url = linksToScrape[i];
      const urlSlug = url.split('/').filter(Boolean).pop() || url;
      console.log(`\n  [${i + 1}/${linksToScrape.length}] ${urlSlug.slice(0, 40)}...`);
      
      const detailData = await scrapeCafeDetail(page, url);
      
      if (detailData?.name) {
        const cafe: CafeData = {
          name: detailData.name,
          slug: generateSlug(detailData.name, city),
          city,
          country,
          countryCode,
          sourceUrl: url,
        };
        
        // Add optional fields
        if (detailData.address) cafe.address = detailData.address;
        if (detailData.instagram) cafe.instagram = detailData.instagram;
        if (detailData.website) cafe.website = detailData.website;
        if (detailData.imageUrl) cafe.imageUrl = detailData.imageUrl;
        if (detailData.description) cafe.description = detailData.description;
        if (detailData.openingHours) cafe.openingHours = detailData.openingHours;
        if (detailData.serving) cafe.serving = detailData.serving;
        if (detailData.services) cafe.services = detailData.services;
        
        // Geocode if we have address
        if (cafe.address) {
          const coords = await geocode(cafe.address);
          if (coords) {
            cafe.lat = coords.lat;
            cafe.lng = coords.lng;
            console.log(`    Geocoded: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          }
          await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit
        }
        
        cafes.push(cafe);
        console.log(`    ✓ ${cafe.name}`);
        console.log(`      Address: ${cafe.address || 'N/A'}`);
        console.log(`      Instagram: @${cafe.instagram || 'N/A'}`);
        console.log(`      Website: ${cafe.website || 'N/A'}`);
        console.log(`      Image: ${cafe.imageUrl ? 'Yes' : 'No'}`);
      } else {
        console.log(`    ✗ Skipped: no name`);
      }
      
      // Save after each cafe
      const outputDir = path.join(process.cwd(), '.tmp');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, `cafes_enhanced_${city.toLowerCase()}.json`), JSON.stringify(cafes, null, 2));
      
      await page.waitForTimeout(1000); // Rate limiting
    }
    
  } catch (e) {
    console.log(`Error: ${(e as Error).message}`);
  } finally {
    await browser.close();
  }
  
  console.log(`\nCollected ${cafes.length} cafes from ${city}`);
  return cafes;
}

async function main() {
  const args = process.argv.slice(2);
  const cityArg = args.find(a => a.startsWith('--city='))?.split('=')[1];
  const allArg = args.includes('--all');
  const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '25', 10);
  
  if (!cityArg && !allArg) {
    console.log('Usage: npx tsx tools/scrape_cafes_enhanced.ts --city=Munich --limit=5');
    console.log('       npx tsx tools/scrape_cafes_enhanced.ts --all --limit=10');
    process.exit(1);
  }
  
  const cities = allArg ? Object.keys(CITY_COUNTRY_MAP) : [cityArg!];
  
  console.log('European Coffee Trip Enhanced Scraper');
  console.log(`Cities: ${cities.join(', ')}`);
  console.log(`Limit per city: ${limitArg}`);
  
  const allCafes: CafeData[] = [];
  
  for (const city of cities) {
    if (!CITY_COUNTRY_MAP[city]) {
      console.log(`Unknown city: ${city}`);
      continue;
    }
    const cityCafes = await scrapeCity(city, limitArg);
    allCafes.push(...cityCafes);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total cafes: ${allCafes.length}`);
  
  // Attribute analysis
  const attrs: Record<string, number> = {};
  for (const cafe of allCafes) {
    for (const [k, v] of Object.entries(cafe)) {
      if (v) attrs[k] = (attrs[k] || 0) + 1;
    }
  }
  
  console.log('\nAttributes:');
  for (const [k, v] of Object.entries(attrs).sort((a, b) => b[1] - a[1])) {
    const pct = allCafes.length > 0 ? ((v / allCafes.length) * 100).toFixed(0) : '0';
    console.log(`  ${k}: ${v}/${allCafes.length} (${pct}%)`);
  }
  
  // Final save
  const outputDir = path.join(process.cwd(), '.tmp');
  fs.writeFileSync(path.join(outputDir, 'cafes_enhanced_final.json'), JSON.stringify(allCafes, null, 2));
  console.log(`\nSaved: ${path.join(outputDir, 'cafes_enhanced_final.json')}`);
}

main().catch(e => { console.error(e); process.exit(1); });