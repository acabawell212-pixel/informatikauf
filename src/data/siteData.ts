const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const weekDays = [
  { name: 'Senin', short: 'SEN' },
  { name: 'Selasa', short: 'SEL' },
  { name: 'Rabu', short: 'RAB' },
  { name: 'Kamis', short: 'KAM' },
  { name: 'Jumat', short: 'JUM' },
  { name: 'Sabtu', short: 'SAB' },
  { name: 'Minggu', short: 'MIN' },
] as const;

export type ScheduleClass = {
  start: string;
  end: string;
  code: string;
  name: string;
  sks: number;
  coordinator: string;
  lecturers: string[];
  room: string;
};

// Jadwal resmi Semester Ganjil 2026/2027 - Kelas REG, Semester I. Perkuliahan mulai Oktober 2026.
export const classSchedule: Record<string, ScheduleClass[]> = {
  Senin: [],
  Selasa: [
    { start: '09.50', end: '11.50', code: 'UF2202', name: 'Bahasa Indonesia', sks: 2, coordinator: 'Erwan Darmawan, S.T., M.T', lecturers: ['Trikawati, M.Pd'], room: 'Daring' },
  ],
  Rabu: [
    { start: '08.00', end: '10.30', code: 'IFS.0103', name: 'Pengenalan Pemrograman', sks: 3, coordinator: 'Febri, S.Kom., M.Kom', lecturers: ['Febri, S.Kom., M.Kom'], room: 'Lab Kom' },
    { start: '10.30', end: '13.00', code: 'IFS.0101', name: 'Algoritma Pemrograman', sks: 3, coordinator: 'Dede Brahma Arianto, S.Kom., M.TI', lecturers: ['Dede Brahma Arianto, S.Kom., M.Kom'], room: 'C302' },
    { start: '13.00', end: '14.40', code: 'IFS.0104', name: 'Bahasa Inggris I', sks: 2, coordinator: 'Anisa Aulia, S.Kom., M.Kom', lecturers: ['Ulinuha Dahlina, M.Pd.'], room: 'C302' },
    { start: '14.40', end: '16.40', code: 'IFS.0102', name: 'Kalkulus', sks: 3, coordinator: 'Meldi Anggra Saputra, S.Kom., M.TI', lecturers: ['Agnest Mela Dwi Kusmiaty, S.T., M.T'], room: 'C303' },
  ],
  Kamis: [
    { start: '09.50', end: '11.50', code: 'UF2102', name: 'Agama', sks: 2, coordinator: 'Iqbal Fernando, S.Kom., M.TI', lecturers: ['Ustd. Nurjaman, M.Pd'], room: 'Daring' },
    { start: '15.40', end: '17.20', code: 'UF2201', name: 'Kewarganegaraan', sks: 2, coordinator: 'Nur Karismawati, S.Ars., M.Ars', lecturers: ['Febrian Alwan Baharudin, S.Pd., M.Pd'], room: 'Daring' },
  ],
  Jumat: [
    { start: '14.00', end: '15.40', code: 'UF2101', name: 'Pancasila', sks: 2, coordinator: 'Lani Febriani, SE., MKM', lecturers: ['Drs. H. Dedi Mulyadi, MM', 'Achmad Machron Chairulfalah, M.I.'], room: 'Daring' },
  ],
  Sabtu: [],
  Minggu: [],
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
