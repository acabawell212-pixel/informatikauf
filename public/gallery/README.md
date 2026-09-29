# Foto Galeri

Foto dipisah dalam subfolder kategori agar gampang dicari:

- `kebersamaan/` — foto kumpul, kelas, atau PKKMB.
- `coding-session/` — foto ngoding bersama atau belajar di lab.
- `meme/` — meme dan humor komunitas Informatika.
- `sad/` — meme sedih dan momen relatable.
- `video/` — file video untuk galeri (MP4 disarankan).

Contoh foto yang sudah dipasang: `kebersamaan/kebersamaan-malam.jpeg`.

Untuk menambah foto, salin ke folder kategori lalu buka `src/data/siteData.ts` → `galleryPhotos`. Tambahkan item dengan `category` sesuai kategori dan `image` memakai path publik, misalnya `/gallery/kebersamaan/foto-kelas.jpg`. Nama file/path harus sama persis. Format umum JPG/JPEG, PNG, dan WebP.

Gambar `contoh-foto.svg` dan `contoh-meme.svg` hanyalah contoh; ganti dengan dokumentasi atau meme buatan komunitas. Foto anggota bisa disimpan di folder kategori mana saja dan dipasang melalui properti `photo` pada array `members`.
