#!/usr/bin/env node
/**
 * Generate complete seed file with all fields
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

async function main() {
  console.log('Loading cafes data...');
  const cafes: CafeData[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), INPUT_FILE), 'utf-8'));
  
  // Featured cafes
  const featuredSlugs = [
    'man-versus-machine-munich',
    'java-cafe-speciality-roasters-warsaw',
    'bonanza-coffee-berlin',
    '19-grams-tres-cabezas-berlin',
    'kawa-roastery-x-berg-berlin',
    'smash-cafe-roastery-poznan',
  ];
  
  // Generate seed file
  const lines: string[] = [];
  lines.push('import { PrismaClient } from "@prisma/client";');
  lines.push('import { PrismaNeon } from "@prisma/adapter-neon";');
  lines.push('');
  lines.push('const adapter = new PrismaNeon({');
  lines.push('  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,');
  lines.push('});');
  lines.push('const prisma = new PrismaClient({ adapter });');
  lines.push('');
  lines.push('const SEED_CAFES = [');
  
  for (const cafe of cafes) {
    const featured = featuredSlugs.includes(cafe.slug);
    const desc = (cafe.description || '').replace(/"/g, '\\"').slice(0, 500);
    const addr = cafe.address ? cafe.address.replace(/"/g, '\\"') : null;
    const hours = cafe.openingHours ? cafe.openingHours.replace(/"/g, '\\"').replace(/\n/g, '\\n') : null;
    
    lines.push('  {');
    lines.push('    name: "' + cafe.name.replace(/"/g, '\\"') + '",');
    lines.push('    slug: "' + cafe.slug + '",');
    lines.push('    description: "' + desc + '",');
    lines.push('    country: "' + cafe.country + '",');
    lines.push('    countryCode: "' + cafe.countryCode + '",');
    lines.push('    city: "' + cafe.city + '",');
    if (addr) lines.push('    address: "' + addr + '",');
    if (cafe.lat && cafe.lng) {
      lines.push('    lat: ' + cafe.lat.toFixed(6) + ',');
      lines.push('    lng: ' + cafe.lng.toFixed(6) + ',');
    }
    if (cafe.website) lines.push('    website: "' + cafe.website + '",');
    if (cafe.instagram) lines.push('    instagram: "' + cafe.instagram.replace(/^@/, '') + '",');
    if (cafe.imageUrl) lines.push('    coverImageUrl: "' + cafe.imageUrl + '",');
    if (cafe.sourceUrl) lines.push('    sourceUrl: "' + cafe.sourceUrl + '",');
    if (hours) lines.push('    openingHours: "' + hours.slice(0, 1000) + '",');
    if (cafe.serving && cafe.serving.length > 0) {
      lines.push('    serving: [' + cafe.serving.map(s => '"' + s.replace(/"/g, '\\"') + '"').join(', ') + '],');
    }
    if (cafe.services && cafe.services.length > 0) {
      lines.push('    services: [' + cafe.services.map(s => '"' + s.replace(/"/g, '\\"') + '"').join(', ') + '],');
    }
    lines.push('    status: "VERIFIED" as const,');
    lines.push('    featured: ' + featured + ',');
    lines.push('  },');
  }
  
  lines.push('];');
  lines.push('');
  lines.push('async function main() {');
  lines.push('  console.log("Seeding ' + cafes.length + ' cafes...");');
  lines.push('');
  lines.push('  for (const cafe of SEED_CAFES) {');
  lines.push('    const created = await prisma.cafe.upsert({');
  lines.push('      where: { slug: cafe.slug },');
  lines.push('      update: cafe,');
  lines.push('      create: {');
  lines.push('        ...cafe,');
  lines.push('        verifiedAt: new Date(),');
  lines.push('      },');
  lines.push('    });');
  lines.push('    console.log("  ✓ " + created.name);');
  lines.push('  }');
  lines.push('');
  lines.push('  console.log("\\nDone!");');
  lines.push('}');
  lines.push('');
  lines.push('main()');
  lines.push('  .catch((e) => {');
  lines.push('    console.error(e);');
  lines.push('    process.exit(1);');
  lines.push('  })');
  lines.push('  .finally(() => prisma.$disconnect());');
  
  fs.writeFileSync(path.join(process.cwd(), OUTPUT_FILE), lines.join('\n'));
  console.log('Seed file written: ' + OUTPUT_FILE);
  console.log('Total cafes: ' + cafes.length);
  
  // Stats
  const withCoords = cafes.filter(c => c.lat && c.lng).length;
  const withAddress = cafes.filter(c => c.address).length;
  const withHours = cafes.filter(c => c.openingHours).length;
  const withServing = cafes.filter(c => c.serving && c.serving.length > 0).length;
  const withServices = cafes.filter(c => c.services && c.services.length > 0).length;
  
  console.log('\nStats:');
  console.log('  Coords: ' + withCoords + '/' + cafes.length);
  console.log('  Address: ' + withAddress + '/' + cafes.length);
  console.log('  Hours: ' + withHours + '/' + cafes.length);
  console.log('  Serving: ' + withServing + '/' + cafes.length);
  console.log('  Services: ' + withServices + '/' + cafes.length);
}

main();