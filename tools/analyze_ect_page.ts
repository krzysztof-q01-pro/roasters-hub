#!/usr/bin/env node
/**
 * Analyze ECT listing page and find cafe detail URLs
 */

import { chromium } from 'playwright';

const SEARCH_URL = 'https://europeancoffeetrip.com/?s=Berlin';

async function main() {
  console.log('Analyzing ECT listing page...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    console.log(`Navigating to: ${SEARCH_URL}`);
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle', timeout: 60000 });
    
    await page.waitForTimeout(5000);
    
    // Check title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Find all cafe links
    console.log('\n=== Cafe Links ===');
    const links = await page.locator('a[href*="/cafe/"]').evaluateAll(links => 
      links.map(l => (l as HTMLAnchorElement).href)
        .filter(h => h.includes('/cafe/') && !h.includes('?'))
        .filter((v, i, a) => a.indexOf(v) === i)
    );
    
    console.log(`Found ${links.length} cafe links`);
    links.slice(0, 20).forEach((l, i) => console.log(`  ${i + 1}. ${l}`));
    
    // Now try to visit first cafe detail page
    if (links.length > 0) {
      const firstCafeUrl = links[0];
      console.log(`\n=== Visiting first cafe: ${firstCafeUrl} ===`);
      
      await page.goto(firstCafeUrl, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);
      
      const cafeTitle = await page.title();
      console.log(`Cafe page title: ${cafeTitle}`);
      
      // Get the main content HTML
      const bodyText = await page.locator('body').innerText();
      console.log(`\nBody text length: ${bodyText.length}`);
      console.log(`\nFirst 2000 chars of body:\n${bodyText.slice(0, 2000)}`);
      
      // Check for JSON-LD
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
      console.log(`\n=== JSON-LD Scripts (${jsonLdScripts.length}) ===`);
      
      for (const script of jsonLdScripts) {
        try {
          const content = await script.innerText();
          const data = JSON.parse(content);
          if (data['@type'] === 'CafeOrCoffeeShop' || data['@type'] === 'LocalBusiness' || data['@graph']) {
            console.log(JSON.stringify(data, null, 2).slice(0, 3000));
          }
        } catch (e) {}
      }
      
      // Check all links
      console.log('\n=== All Links on Page ===');
      const allLinks = await page.locator('a[href]').all();
      console.log(`Total links: ${allLinks.length}`);
      
      const websiteLinks: string[] = [];
      const igLinks: string[] = [];
      const phoneLinks: string[] = [];
      const emailLinks: string[] = [];
      
      for (const link of allLinks) {
        try {
          const href = await link.getAttribute('href') || '';
          const text = (await link.innerText()).toLowerCase();
          
          // Website (not social, not ect)
          if (!href.includes('europeancoffeetrip') && !href.includes('instagram') && !href.includes('facebook') && !href.includes('twitter') && !href.includes('x.com')) {
            if (text.includes('website') || text.includes('visit') || text.includes('order') || text.includes('www')) {
              websiteLinks.push(`"${text.trim()}" => ${href}`);
            }
          }
          
          // Instagram
          if (href.includes('instagram.com')) {
            igLinks.push(href);
          }
          
          // Phone
          if (href.startsWith('tel:')) {
            phoneLinks.push(href);
          }
          
          // Email
          if (href.startsWith('mailto:')) {
            emailLinks.push(href);
          }
        } catch (e) {}
      }
      
      console.log('\nWebsite links:');
      websiteLinks.slice(0, 5).forEach(l => console.log(`  ${l}`));
      
      console.log('\nInstagram links:');
      igLinks.forEach(l => console.log(`  ${l}`));
      
      console.log('\nPhone links:');
      phoneLinks.forEach(l => console.log(`  ${l}`));
      
      console.log('\nEmail links:');
      emailLinks.forEach(l => console.log(`  ${l}`));
      
      // Check for images
      console.log('\n=== Images ===');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
      if (ogImage) console.log(`og:image: ${ogImage}`);
      
      const images = await page.locator('img[src*="http"]').all();
      console.log(`Found ${images.length} images`);
      for (const img of images.slice(0, 5)) {
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        if (src) console.log(`  ${alt?.slice(0, 50) || 'no alt'}: ${src.slice(0, 100)}`);
      }
    }
    
  } catch (e) {
    console.error('Error:', (e as Error).message);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });