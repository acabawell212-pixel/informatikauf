/**
 * Ubah path aset di `public/` menjadi URL yang benar, termasuk saat situs
 * diterbitkan di sub-folder (lihat `base` di vite.config.ts).
 */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
