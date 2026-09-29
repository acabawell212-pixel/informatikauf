# Video Galeri

Taruh video kegiatan di folder kategori masing-masing (contohnya Meme di `public/gallery/meme/`) atau di folder ini. Format yang disarankan MP4 (H.264/AAC). Poster/thumbnail opsional; letakkan juga gambarnya di kategori terkait.

Untuk mendaftarkan video, tambahkan item pada `galleryPhotos` di `src/data/siteData.ts` dengan properti `video` dan `poster`, contohnya:

```ts
{
  id: 'malam-keakraban-video',
  category: 'Kebersamaan',
  title: 'Malam keakraban',
  caption: 'Video keseruan acara komunitas',
  video: '/gallery/video/malam-keakraban.mp4',
  poster: '/gallery/kebersamaan/kebersamaan-malam.jpeg',
  layout: 'landscape',
}
```

Video akan memiliki kontrol play/pause dan volume; klik kartu di luar area kontrol untuk membuka pemutar besar. Gunakan video yang dimiliki/diizinkan untuk dibagikan. Video besar dapat membuat halaman lambat—kompres ke resolusi 1080p atau lebih kecil.
