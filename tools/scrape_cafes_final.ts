#!/usr/bin/env node
/**
 * Robust cafe scraper with incremental saves
 * Usage: npx tsx tools/scrape_cafes_final.ts --city Munich --limit 25
 */

import { chromium, Browser, BrowserContext } from 'playwright';
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
  website?: string;
  instagram?: string;
  phone?: string;
  description?: string;
  source_url: string;
}

function generateSlug(name: string, city: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + city.toLowerCase();
}

async function waitForCloudflare(page: any, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const title = await page.title();
    if (!title.includes('Just a moment')) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function scrapeCity(city: string, limit: number = 25): Promise<CafeData[]> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`City: ${city}`);
  console.log('='.repeat(50));
  
  const cafes: CafeData[] = [];
  const [country, countryCode] = CITY_COUNTRY_MAP[city] || ['Unknown', 'XX'];
  
  // Setup browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    // Search page
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(city)}`;
    console.log(`Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForCloudflare(page);
    await page.waitForTimeout(3000);
    
    // Get cafe links
    const links = await page.locator('a[href*="/cafe/"]').evaluateAll(links => 
      links.map(l => (l as HTMLAnchorElement).href)
        .filter(h => h.includes('/cafe/')&& !h.includes('?'))
        .filter((v, i, a) => a.indexOf(v) === i)
    );
    
    console.log(`Found ${links.length} cafe links`);
    const linksToScrape = links.slice(0, limit);
    console.log(`Will scrape ${linksToScrape.length} cafes`);
    
    // Scrape each cafe
    for (let i = 0; i < linksToScrape.length; i++) {
      const url = linksToScrape[i];
      console.log(`  [${i + 1}/${linksToScrape.length}] ${url.split('/').pop()?.slice(0, 30)}...`);
      
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitForCloudflare(page, 15000);
        await page.waitForTimeout(1000);
        
        // Extract name
        let name = '';
        try {
          name = await page.locator('h1').first().innerText();
          name = name.trim().replace(/\s*\|.*/g, '').slice(0, 100);
        } catch (e) {}
        
        if (!name) {
          console.log(`    Skipping: no name found`);
          continue;
        }
        
        // Extract address
        let address = '';
        try {
          const addrElements = await page.locator('.address, [itemprop="address"], .location, address').all();
          for (const el of addrElements) {
            const text = await el.innerText();
            if (text && text.length > 5 && text.length < 200) {
              address = text.trim();
              break;
            }
          }
        } catch (e) {}
        
        // Extract website
        let website = '';
        try {
          const allLinks = await page.locator('a[href]').all();
          for (const link of allLinks.slice(0, 50)) {
            const href = await link.getAttribute('href') || '';
            const text = (await link.innerText()).toLowerCase();
            if ((text.includes('website') || text.includes('visit') || text.includes('order') || text.includes('www')) &&
                !href.includes('instagram') &&
                !href.includes('facebook') &&
                !href.includes('twitter') &&
                !href.includes('europeancoffeetrip')) {
              website = href;
              break;
            }
          }
        } catch (e) {}
        
        // Extract instagram
        let instagram = '';
        try {
          const igLink = await page.locator("a[href*='instagram.com']").first().getAttribute('href');
          if (igLink) {
            const match = igLink.match(/instagram\.com\/([^/?]+)/);
            if (match) instagram = match[1].replace(/\/$/, '');
          }
        } catch (e) {}
        
        // Extract phone
        let phone = '';
        try {
          const telLink = await page.locator("a[href^='tel:']").first().getAttribute('href');
          if (telLink) phone = telLink.replace('tel:', '').trim();
        } catch (e) {}
        
        // Extract description
        let description = '';
        try {
          const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
          if (metaDesc && metaDesc.length > 20) {
            description = metaDesc.slice(0, 500);
          }
        } catch (e) {}
        
        const cafe: CafeData = {
          name,
          slug: generateSlug(name, city),
          city,
          country,
          countryCode,
          source_url: url,
        };
        
        if (address) cafe.address = address;
        if (website) cafe.website = website;
        if (instagram) cafe.instagram = instagram;
        if (phone) cafe.phone = phone;
        if (description) cafe.description = description;
        
        cafes.push(cafe);
        console.log(`    ✓ ${name}`);
        
        // Save after each cafe
        const outputDir = path.join(process.cwd(), '.tmp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, `cafes_raw_${city.toLowerCase()}.json`), JSON.stringify(cafes, null, 2));
        fs.writeFileSync(path.join(outputDir, 'cafes_seed_all.json'), JSON.stringify({ source: BASE_URL, cities: [city], total_cafes: cafes.length, cafes }, null, 2));
        
        await page.waitForTimeout(800);
        
      } catch (e) {
        console.log(`    Error: ${(e as Error).message}`);
        continue;
      }
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
    console.log('Usage: npx tsx tools/scrape_cafes_final.ts --city=Munich --limit=25');
    console.log('       npx tsx tools/scrape_cafes_final.ts --all --limit=25');
    process.exit(1);
  }
  
  const cities = allArg ? Object.keys(CITY_COUNTRY_MAP) : [cityArg!];
  
  console.log('European Coffee Trip Scraper');
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
  fs.writeFileSync(path.join(outputDir, 'cafes_seed_final.json'), JSON.stringify(allCafes, null, 2));
  console.log(`\nSaved: ${path.join(outputDir, 'cafes_seed_final.json')}`);
}

main().catch(e => {console.error(e); process.exit(1); });