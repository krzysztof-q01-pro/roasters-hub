export function filterByCert<T extends { certifications: string[] }>(
  items: T[],
  cert: string | null
): T[] {
  if (cert === null) return items;
  return items.filter((item) => item.certifications.includes(cert));
}

export function filterByService<T extends { services: string[] }>(
  items: T[],
  service: string | null
): T[] {
  if (service === null) return items;
  return items.filter((item) => item.services.includes(service));
}
