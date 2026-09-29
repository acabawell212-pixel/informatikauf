const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const weekDays = [
  { name: 'Senin', short: 'SEN' },
  { name: 'Selasa', short: 'SEL' },
  { name: 'Rabu', short: 'RAB' },
  { name: 'Kamis', short: 'KAM' },
  { name: 'Jumat', short: 'JUM' },
] as const;

// Contoh data jadwal. Ganti dengan jadwal resmi sesuai kelas dan semester.
export const classSchedule = {
  Senin: [
    { start: '08.00', end: '09.40', name: 'Algoritma & Pemrograman', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 203' },
    { start: '10.00', end: '12.30', name: 'Praktikum Basis Data', type: 'Praktikum', duration: '3 SKS', room: 'Laboratorium Komputer' },
  ],
  Selasa: [
    { start: '08.00', end: '09.40', name: 'Struktur Data', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 201' },
    { start: '10.00', end: '11.40', name: 'Matematika Diskrit', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 204' },
    { start: '13.00', end: '14.40', name: 'Bahasa Inggris', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 202' },
  ],
  Rabu: [
    { start: '08.00', end: '09.40', name: 'Rekayasa Perangkat Lunak', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 203' },
    { start: '10.00', end: '12.30', name: 'Praktikum Sistem Operasi', type: 'Praktikum', duration: '3 SKS', room: 'Laboratorium Komputer' },
  ],
  Kamis: [
    { start: '08.00', end: '09.40', name: 'Jaringan Komputer', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 204' },
    { start: '10.00', end: '12.30', name: 'Praktikum Pemrograman Web', type: 'Praktikum', duration: '3 SKS', room: 'Laboratorium Komputer' },
  ],
  Jumat: [
    { start: '08.00', end: '09.40', name: 'Interaksi Manusia dan Komputer', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 201' },
    { start: '10.00', end: '11.40', name: 'Kewirausahaan Digital', type: 'Teori', duration: '2 SKS', room: 'Ruang Kelas 202' },
  ],
};

export const members = [
  { name: 'Nadia Putri', role: 'Ketua Group', cohort: 'Angkatan 2026/2027', interest: 'Product & UI/UX', initials: 'NP', tone: 'avatar-rose', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85' },
  { name: 'Rizky Ramadhan', role: 'Wakil Ketua', cohort: 'Angkatan 2026/2027', interest: 'Backend & Cloud', initials: 'RR', tone: 'avatar-blue', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=85' },
  { name: 'Alya Maharani', role: 'Koordinator Kreatif', cohort: 'Angkatan 2026/2027', interest: 'Visual Design', initials: 'AM', tone: 'avatar-gold', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=720&q=85' },
  { name: 'Fajar Maulana', role: 'Koordinator Riset', cohort: 'Angkatan 2026/2027', interest: 'Data & AI', initials: 'FM', tone: 'avatar-mint', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=85' },
];

export type GalleryItem = {
  id: string;
  category: string;
  title: string;
  caption: string;
  image?: string;
  video?: string;
  poster?: string;
  layout: 'feature' | 'portrait' | 'landscape';
};

export const galleryPhotos: GalleryItem[] = [
  { id: 'kebersamaan-malam', category: 'Kebersamaan', title: 'Malam penuh cerita', caption: 'Momen berkumpul bersama teman-teman Informatika', image: publicAsset('/gallery/kebersamaan/kebersamaan-malam.jpeg'), layout: 'feature' },
  { id: 'kebersamaan-kampus', category: 'Kebersamaan', title: 'Satu kampus, banyak cerita', caption: 'Contoh layout foto kebersamaan — ganti dengan foto asli', image: publicAsset('/gallery/kebersamaan/kebersamaan-kampus.svg'), layout: 'portrait' },
  { id: 'coding-session', category: 'Coding session', title: 'Sedikit demi sedikit, jadi project', caption: 'Contoh layout foto coding session — ganti dengan foto asli', image: publicAsset('/gallery/coding-session/contoh-foto.svg'), layout: 'landscape' },
  { id: 'meme', category: 'Meme', title: 'Makan sosis di kantin', caption: 'Meme anak Informatika di sela-sela kuliah', image: publicAsset('/gallery/meme/meme-kantin.jpeg'), layout: 'landscape' },
  { id: 'meme-video', category: 'Meme', title: 'Meme kantin — versi video', caption: 'Video meme kiriman komunitas', video: publicAsset('/gallery/meme/WhatsApp%20Video%202026-09-27%20at%2018.24.34.mp4'), poster: publicAsset('/gallery/meme/meme-kantin.jpeg'), layout: 'landscape' },
  { id: 'sad', category: 'Sad', title: 'Hari berat? Istirahat dulu.', caption: 'Contoh template kategori Sad', image: publicAsset('/gallery/sad/contoh-sad.svg'), layout: 'portrait' },
  { id: 'sad-video', category: 'Sad', title: 'Video kenangan', caption: 'Video komunitas kategori Sad', video: publicAsset('/gallery/sad/sad-video.mp4'), poster: publicAsset('/gallery/sad/contoh-sad.svg'), layout: 'landscape' },
];

export const navItems = [
  { label: 'Home', href: '#home', hint: 'Kembali ke halaman utama.' },
  { label: 'About', href: '#about', hint: 'Lihat visi, misi, dan nilai komunitas.' },
  { label: 'Jadwal MK', href: '#schedule', hint: 'Pilih hari untuk melihat jadwal kuliah.' },
  { label: 'Members', href: '#members', hint: 'Kenali teman-teman di komunitas.' },
  { label: 'Galeri', href: '#gallery', hint: 'Buka album foto kenangan.' },
  { label: 'Contact', href: '#contact', hint: 'Temukan cara untuk menghubungi kami.' },
];
