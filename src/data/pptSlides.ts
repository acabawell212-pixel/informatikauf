export interface SlideContent {
  id: number;
  isCover?: boolean;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bullets?: { title: string; desc: string; icon?: string }[];
  codeSnippet?: {
    lang: string;
    filename: string;
    code: string;
  };
  tips?: string;
  quote?: { text: string; author: string };
  category: 'intro' | 'concepts' | 'languages' | 'career' | 'tips';
}

export const pptSlides: SlideContent[] = [
  {
    id: 0,
    isCover: true,
    badge: 'INTRO · KELOMPOK 6',
    category: 'intro',
    title: 'Kelompok 6',
    subtitle: 'Informatika Universitas Faletehan',
    description: 'Mempersembahkan pengenalan dunia coding dan pemrograman.',
  },
  {
    id: 1,
    badge: 'KELOMPOK 6 · OPENING',
    category: 'intro',
    title: 'Pengenalan Dunia Coding & Pemrograman',
    subtitle: 'Memahami Apa Itu Coding Sebelum Memulai',
    description: 'Sesi ini menjawab pertanyaan dasar: apa sebenarnya coding, di mana ia digunakan, dan bagaimana Anda bisa memulai.',
    bullets: [
      { title: 'Informatika Faletehan', desc: 'Komunitas belajar terbuka untuk eksplorasi teknologi bersama.', icon: '⚡' },
      { title: 'Untuk Pemula', desc: 'Tidak memerlukan latar belakang teknis. Cukup rasa ingin tahu.', icon: '🚀' },
      { title: 'Yang Akan Dibahas', desc: 'Apa itu coding, di mana dipakai, proses pembuatan aplikasi, bahasa pemrograman, karier, dan cara memulai.', icon: '🗺️' }
    ],
    tips: 'Gunakan tombol panah kanan ➔ atau tombol Next untuk melanjutkan ke slide berikutnya.'
  },
  {
    id: 2,
    badge: 'SLIDE 02 / 14 · FUNDAMENTALS',
    category: 'intro',
    title: 'Apa Itu Coding?',
    subtitle: 'Menulis Instruksi yang Dapat Dijalankan Komputer',
    description: 'Coding (pemrograman) adalah proses menulis instruksi dalam bahasa pemrograman agar komputer melakukan tugas tertentu.',
    bullets: [
      { title: 'Instruksi', desc: 'Langkah-langkah yang kita tulis, dan komputer menjalankannya persis sesuai tulisan. Contoh: "tampilkan teks Halo, Dunia!".', icon: '📋' },
      { title: 'Bahasa Pemrograman', desc: 'Bahasa khusus untuk menulis instruksi. Contoh: Python, JavaScript, Java.', icon: '💬' },
      { title: 'Program', desc: 'Kumpulan instruksi yang bekerja bersama. Contoh: aplikasi chat, kalkulator, game.', icon: '📦' }
    ],
    codeSnippet: {
      lang: 'python',
      filename: 'halo.py',
      code: `# Contoh instruksi paling sederhana
print("Halo, Dunia!")`
    },
    tips: 'Analogi: coding seperti menulis resep. Komputer adalah juru masak yang sangat patuh, tetapi tidak bisa menebak maksud Anda.'
  },
  {
    id: 3,
    badge: 'SLIDE 03 / 14 · MOTIVATION',
    category: 'intro',
    title: 'Mengapa Coding Penting?',
    subtitle: 'Bukan Hanya Soal Karier, Tapi Cara Berpikir',
    description: 'Coding melatih pola pikir logis dan terstruktur yang bermanfaat di bidang apa pun.',
    bullets: [
      { title: 'Melatih Problem Solving', desc: 'Contoh: masalah "membuat aplikasi kasir" dipecah menjadi daftar produk, keranjang, total harga, dan struk.', icon: '🧩' },
      { title: 'Dari Pengguna Menjadi Pencipta', desc: 'Contoh: dari pengguna toko online menjadi orang yang mampu membuat toko online sederhana.', icon: '🎨' },
      { title: 'Peluang Karier Luas', desc: 'Peran seperti developer, data engineer, dan spesialis keamanan siber dibutuhkan di banyak industri.', icon: '🌍' }
    ],
    quote: {
      text: 'Semua orang di negara ini seharusnya belajar memprogram komputer, karena itu mengajarkan kita cara berpikir.',
      author: 'Steve Jobs'
    }
  },
  {
    id: 4,
    badge: 'SLIDE 04 / 14 · HOW IT WORKS',
    category: 'concepts',
    title: 'Bagaimana Komputer Memahami Kode?',
    subtitle: 'Dari Bahasa Manusia ke Bahasa Mesin',
    description: 'Komputer pada dasarnya hanya memahami sinyal listrik, yang direpresentasikan sebagai 0 dan 1. Bahasa pemrograman menjembatani keduanya.',
    bullets: [
      { title: 'Bahasa Biner', desc: 'Semua data disimpan sebagai 0 dan 1. Contoh: angka 5 direpresentasikan sebagai 101.', icon: '⚙️' },
      { title: 'Penerjemah', desc: 'Kode yang kita tulis diterjemahkan ke instruksi yang dapat dijalankan prosesor, oleh compiler atau interpreter.', icon: '🔄' },
      { title: 'Komputer Tidak Menebak', desc: 'Contoh: satu karakter yang salah pada perintah dapat membuat program gagal berjalan.', icon: '🎯' }
    ],
    tips: 'Karena itu coding menuntut ketelitian: komputer menjalankan apa yang kita tulis, bukan apa yang kita maksud.'
  },
  {
    id: 5,
    badge: 'SLIDE 05 / 14 · REAL WORLD',
    category: 'concepts',
    title: 'Coding di Sekitar Kita',
    subtitle: 'Hampir Semua Teknologi yang Kita Pakai Dijalankan oleh Kode',
    description: 'Coding bukan hanya milik perusahaan teknologi besar. Hasilnya ada di aktivitas kita sehari-hari.',
    bullets: [
      { title: 'Komunikasi & Media Sosial', desc: 'Aplikasi chat, video call, dan platform berbagi foto.', icon: '💬' },
      { title: 'Transportasi & Belanja Online', desc: 'Pemesanan ojek online, marketplace, dan pelacakan paket.', icon: '🛵' },
      { title: 'Keuangan Digital', desc: 'Dompet digital, pembayaran QR, dan mesin ATM.', icon: '💳' },
      { title: 'Perangkat di Sekitar Kita', desc: 'Lampu lalu lintas, televisi pintar, dan portal akademik kampus.', icon: '🏫' }
    ],
    tips: 'Coba hitung: berapa aplikasi yang sudah Anda buka sejak bangun tidur pagi ini?'
  },
  {
    id: 6,
    badge: 'SLIDE 06 / 14 · PROCESS',
    category: 'concepts',
    title: 'Dari Ide Menjadi Aplikasi',
    subtitle: 'Coding Hanyalah Salah Satu Tahap',
    description: 'Membuat aplikasi adalah proses bertahap. Menulis kode berada di tengah, bukan di awal.',
    bullets: [
      { title: '1. Ide & Kebutuhan', desc: 'Contoh: mahasiswa kesulitan melihat jadwal kuliah di satu tempat.', icon: '💡' },
      { title: '2. Rancangan', desc: 'Membuat sketsa tampilan dan alur penggunaan aplikasi.', icon: '✏️' },
      { title: '3. Menulis Kode', desc: 'Programmer mewujudkan rancangan menjadi program yang berjalan.', icon: '⌨️' },
      { title: '4. Menguji & Memperbaiki', desc: 'Mencari bug, lalu memperbaikinya sebelum dipakai pengguna.', icon: '🔍' },
      { title: '5. Rilis & Perawatan', desc: 'Aplikasi dipublikasikan dan terus diperbarui berdasarkan masukan.', icon: '🚀' }
    ]
  },
  {
    id: 7,
    badge: 'SLIDE 07 / 14 · INSIDE A PROGRAM',
    category: 'concepts',
    title: 'Apa Isi di Dalam Sebuah Program?',
    subtitle: 'Empat Peran yang Muncul di Hampir Semua Program',
    description: 'Gambaran umum tanpa kode: program, sekecil atau sebesar apa pun, tersusun dari beberapa peran dasar.',
    bullets: [
      { title: 'Data', desc: 'Menyimpan informasi. Contoh: nama pengguna dan saldo dompet digital.', icon: '🗃️' },
      { title: 'Keputusan', desc: 'Memilih aksi berdasarkan kondisi. Contoh: jika saldo cukup, transaksi diproses; jika tidak, ditolak.', icon: '🔀' },
      { title: 'Pengulangan', desc: 'Mengerjakan tugas yang sama berkali-kali. Contoh: mengirim notifikasi ke ribuan pengguna.', icon: '🔁' },
      { title: 'Fungsi', desc: 'Blok instruksi yang bisa dipakai ulang. Contoh: satu blok untuk menghitung total belanja di mana pun dibutuhkan.', icon: '🧱' }
    ],
    tips: 'Cara menuliskannya dipelajari di sesi lanjutan. Hari ini cukup mengenali perannya.'
  },
  {
    id: 8,
    badge: 'SLIDE 08 / 14 · ECOSYSTEM',
    category: 'languages',
    title: 'Bahasa Pemrograman Populer',
    subtitle: 'Pilih Sesuai Tujuan, Bukan Sekadar Tren',
    description: 'Tidak ada bahasa yang terbaik untuk semua kebutuhan. Mulailah dari pertanyaan: apa yang ingin saya bangun?',
    bullets: [
      { title: 'Python', desc: 'Sintaks sederhana. Contoh penggunaan: analisis data penjualan, chatbot, otomatisasi laporan.', icon: '🐍' },
      { title: 'JavaScript / TypeScript', desc: 'Bahasa utama web. Contoh: situs portofolio, dashboard, aplikasi web interaktif.', icon: '🌐' },
      { title: 'C & C++', desc: 'Performa tinggi. Contoh: game engine, sistem operasi, firmware perangkat IoT.', icon: '⚡' },
      { title: 'Java, Kotlin & Swift', desc: 'Contoh: aplikasi Android (Java/Kotlin) dan aplikasi iPhone (Swift).', icon: '📱' }
    ],
    tips: 'Untuk pemula: kuasai satu bahasa dulu. Konsep dasarnya serupa di hampir semua bahasa.'
  },
  {
    id: 9,
    badge: 'SLIDE 09 / 14 · CAREER PATHS',
    category: 'career',
    title: 'Jalur Karier di Bidang Software',
    subtitle: 'Temukan Bidang yang Sesuai Minat Anda',
    description: 'Dunia teknologi menyediakan banyak spesialisasi. Tidak perlu memutuskan sekarang.',
    bullets: [
      { title: 'Web Development', desc: 'Contoh hasil kerja: situs kampus, toko online, sistem informasi akademik.', icon: '💻' },
      { title: 'Mobile Development', desc: 'Contoh hasil kerja: aplikasi absensi, aplikasi transportasi, dompet digital.', icon: '📱' },
      { title: 'Data Science & AI / ML', desc: 'Contoh hasil kerja: prediksi penjualan, sistem rekomendasi, pengenalan gambar.', icon: '🤖' },
      { title: 'Cybersecurity & Cloud / DevOps', desc: 'Contoh hasil kerja: menguji keamanan sistem, mengelola server, deployment otomatis.', icon: '🛡️' }
    ]
  },
  {
    id: 10,
    badge: 'SLIDE 10 / 14 · DEV TOOLS',
    category: 'career',
    title: 'Tools yang Dipakai Developer',
    subtitle: 'Perlengkapan Kerja Sehari-hari',
    description: 'Developer tidak hanya menulis kode. Mereka memakai tools yang membuat kerja lebih efisien dan terorganisir.',
    bullets: [
      { title: 'VS Code', desc: 'Code editor dengan ekstensi, autocomplete, dan debugger bawaan.', icon: '📝' },
      { title: 'Git & GitHub', desc: 'Contoh: kembali ke versi kode kemarin jika perubahan hari ini merusak program.', icon: '🐙' },
      { title: 'Terminal / CLI', desc: 'Contoh: menjalankan program atau memasang library dengan satu perintah teks.', icon: '💻' },
      { title: 'AI Assistant', desc: 'Contoh: meminta penjelasan pesan error. Hasilnya tetap harus diperiksa.', icon: '✨' }
    ]
  },
  {
    id: 11,
    badge: 'SLIDE 11 / 14 · MYTHS & FACTS',
    category: 'tips',
    title: 'Mitos dan Fakta Seputar Coding',
    subtitle: 'Meluruskan Anggapan yang Sering Membuat Pemula Ragu',
    description: 'Beberapa anggapan umum membuat orang urung mencoba. Mari kita periksa satu per satu.',
    bullets: [
      { title: 'Mitos: Harus jago matematika', desc: 'Fakta: untuk web dan aplikasi dasar, logika dan ketelitian lebih penting. Bidang data dan AI memang membutuhkan lebih banyak matematika.', icon: '➗' },
      { title: 'Mitos: Harus laptop mahal', desc: 'Fakta: belajar dasar umumnya cukup dengan laptop standar yang bisa menjalankan editor kode dan browser.', icon: '💻' },
      { title: 'Mitos: Programmer bekerja sendirian', desc: 'Fakta: pekerjaan software umumnya kerja tim, dengan diskusi dan code review.', icon: '👥' },
      { title: 'Mitos: Programmer yang baik tidak pernah error', desc: 'Fakta: menemukan dan memperbaiki error (debugging) adalah bagian rutin pekerjaan.', icon: '🐞' }
    ]
  },
  {
    id: 12,
    badge: 'SLIDE 12 / 14 · GETTING STARTED',
    category: 'tips',
    title: 'Bagaimana Cara Memulai?',
    subtitle: 'Keluar dari Tutorial Hell, Mulai Membuat Project',
    description: 'Menonton tutorial saja tidak cukup. Kemampuan terbentuk ketika kita menulis dan memperbaiki kode sendiri.',
    bullets: [
      { title: 'Pilih Satu Bahasa', desc: 'Contoh: JavaScript jika tertarik web, Python jika tertarik data.', icon: '🎯' },
      { title: 'Buat Project Kecil', desc: 'Contoh: kalkulator nilai, to-do list, halaman biodata.', icon: '🔨' },
      { title: 'Konsisten Setiap Hari', desc: 'Contoh: 30–60 menit per hari. Latihan rutin umumnya lebih efektif daripada maraton sekali seminggu.', icon: '📅' },
      { title: 'Belajar Bersama Komunitas', desc: 'Contoh: minta teman membaca kode Anda dan beri masukan.', icon: '🤝' }
    ],
    tips: 'Contoh rencana 4 minggu: Minggu 1 dasar · Minggu 2 latihan soal kecil · Minggu 3 project mini · Minggu 4 rapikan dan unggah ke GitHub.'
  },
  {
    id: 13,
    badge: 'SLIDE 13 / 14 · INFORMATIKA FALETEHAN',
    category: 'intro',
    title: 'Belajar Bersama Informatika Faletehan',
    subtitle: 'Ruang Kolaborasi, Riset, dan Karya Mahasiswa',
    description: 'Anda tidak belajar sendirian. Kita bertumbuh bersama, dari dasar hingga menghasilkan project nyata.',
    bullets: [
      { title: 'Build Night & Study Jam', desc: 'Sesi santai untuk mengulik teknologi, membahas tugas, dan latihan coding.', icon: '☕' },
      { title: 'Showcase Project', desc: 'Tempat memamerkan karya web, mobile, game, dan riset.', icon: '🏆' },
      { title: 'Mentoring', desc: 'Bimbingan dari senior dan dosen untuk lomba, magang, dan karya ilmiah.', icon: '🎓' }
    ]
  },
  {
    id: 14,
    badge: 'SLIDE 14 / 14 · CLOSING & ACTION',
    category: 'intro',
    title: 'Mulai Hari Ini: Tulis Kode Pertamamu',
    subtitle: '"Perjalanan seribu mil dimulai dari satu langkah."',
    description: 'Tiga langkah konkret yang dapat dimulai hari ini.',
    bullets: [
      { title: 'Langkah 1: Siapkan Tools', desc: 'Pasang VS Code, serta Node.js atau Python.', icon: '1️⃣' },
      { title: 'Langkah 2: Buat Project Mini', desc: 'Contoh: halaman biodata sederhana seperti kode di samping, lalu buka di browser.', icon: '2️⃣' },
      { title: 'Langkah 3: Bagikan & Diskusikan', desc: 'Tunjukkan hasilnya ke teman atau komunitas untuk mendapat masukan.', icon: '3️⃣' }
    ],
    codeSnippet: {
      lang: 'html',
      filename: 'biodata.html',
      code: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Biodata Saya</title>
</head>
<body>
  <h1>Halo, saya Rani</h1>
  <p>Mahasiswa Informatika semester 1.</p>
</body>
</html>`
    },
    quote: {
      text: 'Build. Create. Innovate. Jangan takut salah, mulailah sekarang.',
      author: 'Keluarga Informatika Universitas Faletehan'
    }
  }
];