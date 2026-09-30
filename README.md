# Group Informatika Universitas Faletehan

Website komunitas Informatika Universitas Faletehan yang dibangun dengan React, TypeScript, dan Vite. Desain responsif mencakup profil komunitas, jadwal mata kuliah yang bisa dipilih per hari, anggota, galeri foto/video, dan formulir kontak.

## Menjalankan secara lokal

1. Pastikan Node.js dan npm tersedia.
2. Jalankan `npm install` dari folder project.
3. Jalankan `npm run dev` untuk membuka server pengembangan Vite.
4. Jalankan `npm run build` untuk membuat build produksi.

## Publikasikan lewat GitHub Pages

Workflow GitHub Actions sudah disiapkan di `.github/workflows/deploy.yml`.

1. Buat repository baru di GitHub lalu upload/push seluruh project ini, termasuk `package-lock.json`.
2. Pastikan branch utama bernama `main` atau `master`.
3. Di repository GitHub, buka **Settings → Pages**, lalu pilih **GitHub Actions** pada bagian *Build and deployment*.
4. Buka tab **Actions** dan tunggu workflow **Deploy to GitHub Pages** selesai.
5. Buka alamat Pages yang ditampilkan di **Settings → Pages**.

Setiap push berikutnya ke `main` atau `master` akan memicu deploy otomatis. Foto/video lokal galeri ikut terbit karena disimpan di `public/gallery/`. Ganti konten contoh dan pastikan kamu memiliki izin untuk menerbitkan foto/video sebelum membagikan situs.

## Struktur utama

- `src/components/` — navigasi, hero, identitas, dan heading reusable.
- `src/sections/` — section modular halaman.
- `src/data/siteData.ts` — contoh jadwal mata kuliah, foto galeri, anggota, dan navigasi.
- `public/gallery/` — tempat menyimpan foto/video lokal galeri dan profil anggota.
- `src/styles/globals.css` — design system, layout, dan breakpoint responsif.
- `src/styles/motion.css` — animasi, efek interaksi, dan reduced-motion.
- `src/styles/polish.css` — penyesuaian keterbacaan, hierarki, dan motion.
- `src/styles/schedule.css` — tata letak jadwal kuliah dan tab hari.
- `src/styles/gallery.css` — grid foto responsif dan tampilan lightbox.
- `src/styles/vibrant.css` — tema cerah berwarna dengan aksen indigo, cyan, dan coral.
- `src/styles/fantasy.css` — tema petualangan fantasi original dengan aksen teal, parchment, dan emas.
- `src/styles/readability.css` — ukuran teks yang lebih besar dan gaya foto profil anggota.
- `src/styles/interactive-hints.css` — tooltip hover dan keyboard untuk menjelaskan aksi kontrol.
- `src/styles/textures.css` — tekstur kertas, garis peta, dan ornamen fantasy original.
- `src/styles/scroll-motion.css` — animasi reveal berulang yang mengikuti arah scroll.
- `src/styles/opening-intro.css` — splash screen pembuka bergaya fantasy untuk kunjungan pertama per tab.
- `src/styles/ui-sounds.css` — tombol kendali suara klik & hover di sudut kanan bawah.
- `src/styles/hero-title.css` — judul hero "Welcome to INFORMATIKA Universitas Faletehan" dengan animasi huruf.

## Catatan sebelum publikasi

Konten organisasi, jadwal kuliah, foto galeri, nama anggota, statistik, dan alamat email saat ini merupakan contoh dan perlu diganti dengan data/foto resmi. Form kontak hanya demo antarmuka; hubungkan ke backend atau layanan email agar pesan dapat diterima. Link sosial juga perlu diarahkan ke akun resmi. Font dan foto contoh membutuhkan koneksi internet.
