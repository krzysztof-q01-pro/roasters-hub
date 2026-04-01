#!/usr/bin/env node
/**
 * Geocode cafes without coordinates and generate seed file
 */

import * as fs from 'fs';
import * as path from 'path';

const INPUT_FILE = '.tmp/cafes_enhanced_final.json';
const OUTPUT_FILE = 'web/prisma/seed_cafes.ts';

interface CafeData {
  name: string;
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  sourceUrl: string;
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
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=1';
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
    console.log('    Geocoding failed: ' + ((e as Error).message));
  }
  return null;
}

async function main() {
  console.log('Loading cafes data...');
  const cafes: CafeData[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), INPUT_FILE), 'utf-8'));
  
  console.log('Total cafes: ' + cafes.length);
  console.log('Without coords: ' + cafes.filter(c => !c.lat || !c.lng).length);
  
  // Geocode cafes without coordinates
  for (const cafe of cafes) {
    if (!cafe.lat || !cafe.lng) {
      const query = cafe.name + ', ' + cafe.city + ', ' + cafe.country;
      console.log('  Geocoding: ' + cafe.name + ' (' + cafe.city + ')...');
      const coords = await geocode(query);
      if (coords) {
        cafe.lat = coords.lat;
        cafe.lng = coords.lng;
        console.log('    ✓ ' + coords.lat.toFixed(4) + ', ' + coords.lng.toFixed(4));
      }
      await new Promise(r => setTimeout(r, 1100)); // Rate limit
    }
  }
  
  // Clean Instagram handles
  for (const cafe of cafes) {
    if (cafe.instagram) {
      cafe.instagram = cafe.instagram.replace(/^@/, '').replace(/^N\/A$/, '');
      if (!cafe.instagram) delete cafe.instagram;
    }
  }
  
  // Final stats
  console.log('\n=== Final Stats ===');
  const fields = ['address', 'lat', 'lng', 'instagram', 'website', 'imageUrl'];
  for (const f of fields) {
    const count = cafes.filter(c => c[f as keyof CafeData]).length;
    console.log(f + ': ' + count + '/' + cafes.length + ' (' + Math.round(count/cafes.length*100) + '%)');
  }
  
  // Featured cafes
  const featuredSlugs = [
    'man-versus-machine-munich',
    'najmniejsza-kawiarnia-w-polsce-warsaw',
    'java-cafe-speciality-roasters-warsaw',
    'bonanza-coffee-berlin',
    '19-grams-tres-cabezas-berlin',
    'kawa-roastery-x-berg-berlin',
    'smash-cafe-roastery-poznan',
  ];
  
  // Generate seed file
  const seedLines: string[] = [];
  seedLines.push('import { PrismaClient } from "@prisma/client";');
  seedLines.push('import { PrismaNeon } from "@prisma/adapter-neon";');
  seedLines.push('');
  seedLines.push('const adapter = new PrismaNeon({');
  seedLines.push('  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,');
  seedLines.push('});');
  seedLines.push('const prisma = new PrismaClient({ adapter });');
  seedLines.push('');
  seedLines.push('const SEED_CAFES = [');
  
  for (const cafe of cafes) {
    const featured = featuredSlugs.includes(cafe.slug);
    const desc = (cafe.description || '').replace(/"/g, '\\"').slice(0, 200);
    const addr = cafe.address ? cafe.address.replace(/"/g, '\\"') : null;
    
    seedLines.push('  {');
    seedLines.push('    name: "' + cafe.name.replace(/"/g, '\\"') + '",');
    seedLines.push('    slug: "' + cafe.slug + '",');
    seedLines.push('    description: "' + desc + '",');
    seedLines.push('    country: "' + cafe.country + '",');
    seedLines.push('    countryCode: "' + cafe.countryCode + '",');
    seedLines.push('    city: "' + cafe.city + '",');
    if (addr) seedLines.push('    address: "' + addr + '",');
    if (cafe.lat && cafe.lng) {
      seedLines.push('    lat: ' + cafe.lat + ',');
      seedLines.push('    lng: ' + cafe.lng + ',');
    }
    if (cafe.website) seedLines.push('    website: "' + cafe.website + '",');
    if (cafe.instagram) seedLines.push('    instagram: "' + cafe.instagram + '",');
    if (cafe.imageUrl) seedLines.push('    imageUrl: "' + cafe.imageUrl + '",');
    seedLines.push('    status: "VERIFIED" as const,');
    seedLines.push('    featured: ' + featured + ',');
    seedLines.push('    sourceUrl: "' + cafe.sourceUrl + '",');
    seedLines.push('  },');
  }
  
  seedLines.push('];');
  seedLines.push('');
  seedLines.push('async function main() {');
  seedLines.push('  console.log("Seeding cafes...");');
  seedLines.push('');
  seedLines.push('  for (const cafe of SEED_CAFES) {');
  seedLines.push('    const created = await prisma.cafe.upsert({');
  seedLines.push('      where: { slug: cafe.slug },');
  seedLines.push('      update: cafe,');
  seedLines.push('      create: {');
  seedLines.push('        ...cafe,');
  seedLines.push('        verifiedAt: new Date(),');
  seedLines.push('      },');
  seedLines.push('    });');
  seedLines.push('');
  seedLines.push('    console.log("  ✓ " + created.name + " (" + created.slug + ")");');
  seedLines.push('  }');
  seedLines.push('');
  seedLines.push('  console.log("\\nSeeded " + SEED_CAFES.length + " cafes.");');
  seedLines.push('}');
  seedLines.push('');
  seedLines.push('main()');
  seedLines.push('  .catch((e) => {');
  seedLines.push('    console.error(e);');
  seedLines.push('    process.exit(1);');
  seedLines.push('  })');
  seedLines.push('  .finally(() => prisma.$disconnect());');
  
  const seedContent = seedLines.join('\n');
  fs.writeFileSync(path.join(process.cwd(), OUTPUT_FILE), seedContent);
  console.log('\nSeed file written to: ' + OUTPUT_FILE);
  
  // Also save enhanced JSON
  fs.writeFileSync(
    path.join(process.cwd(), INPUT_FILE), 
    JSON.stringify(cafes, null, 2)
  );
  console.log('Updated JSON saved to: ' + INPUT_FILE);
}

main().catch(e => { console.error(e); process.exit(1); });