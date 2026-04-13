// Placeholder photos for new entities discovered via enrichment
// Photos are served from /images/placeholders/ (static assets)
// Replace files in web/public/images/placeholders/ with curated photos

export const PLACEHOLDER_PHOTOS = {
  CAFE: [
    '/images/placeholders/cafe-01.jpg',
    '/images/placeholders/cafe-02.jpg',
    '/images/placeholders/cafe-03.jpg',
    '/images/placeholders/cafe-04.jpg',
    '/images/placeholders/cafe-05.jpg',
  ],
  ROASTER: [
    '/images/placeholders/roaster-01.jpg',
    '/images/placeholders/roaster-02.jpg',
    '/images/placeholders/roaster-03.jpg',
    '/images/placeholders/roaster-04.jpg',
    '/images/placeholders/roaster-05.jpg',
  ],
} as const

export function randomPlaceholder(type: 'CAFE' | 'ROASTER'): string {
  const photos = PLACEHOLDER_PHOTOS[type]
  return photos[Math.floor(Math.random() * photos.length)]
}
