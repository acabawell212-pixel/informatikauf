const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

// Jadwal resmi Semester Ganjil 2026/2027 - Kelas REG, Semester I.
export const scheduleInfo = {
  title: 'Jadwal Semester Ganjil Tahun Akademik 2026/2027',
  className: 'Kelas REG',
  semester: 'Semester I',
  start: 'Mulai perkuliahan Oktober 2026',
};

export const scheduleCourses = [
  { no: 1, code: 'IFS.0101', course: 'Algoritma Pemrograman', sks: 3, coordinator: 'Dede Brahma Arianto, S.Kom., M.TI', lecturers: ['Dede Brahma Arianto, S.Kom., M.Kom'], time: 'Rabu, 10.30 s/d 13.00', room: 'C302' },
  { no: 2, code: 'IFS.0102', course: 'Kalkulus', sks: 3, coordinator: 'Meldi Anggra Saputra, S.Kom., M.TI', lecturers: ['Agnest Mela Dwi Kusmiaty, S.T., M.T'], time: 'Rabu, 14.40 s/d 16.40', room: 'C303' },
  { no: 3, code: 'IFS.0103', course: 'Pengenalan Pemrograman', sks: 3, coordinator: 'Febri, S.Kom., M.Kom', lecturers: ['Febri, S.Kom., M.Kom'], time: 'Rabu, 08.00 s/d 10.30', room: 'Lab Kom' },
  { no: 4, code: 'IFS.0104', course: 'Bahasa Inggris I', sks: 2, coordinator: 'Anisa Aulia, S.Kom., M.Kom', lecturers: ['Ulinuha Dahlina, M.Pd.'], time: 'Rabu, 13.00 s/d 14.40', room: 'C302' },
  { no: 5, code: 'UF2201', course: 'Kewarganegaraan', sks: 2, coordinator: 'Nur Karismawati, S.Ars., M.Ars', lecturers: ['Febrian Alwan Baharudin, S.Pd., M.Pd'], time: 'Kamis, 15.40 - 17.20', room: 'Daring' },
  { no: 6, code: 'UF2101', course: 'Pancasila', sks: 2, coordinator: 'Lani Febriani, SE., MKM', lecturers: ['Drs. H. Dedi Mulyadi, MM', 'Achmad Machron Chairulfalah, M.I.'], time: "Jum'at, 14.00 - 15.40", room: 'Daring' },
  { no: 7, code: 'UF2102', course: 'Agama', sks: 2, coordinator: 'Iqbal Fernando, S.Kom., M.TI', lecturers: ['Ustd. Nurjaman, M.Pd'], time: 'Kamis, 09.50 - 11.50', room: 'Daring' },
  { no: 8, code: 'UF2202', course: 'Bahasa Indonesia', sks: 2, coordinator: 'Erwan Darmawan, S.T., M.T', lecturers: ['Trikawati, M.Pd'], time: 'Selasa, 09.50 - 11.50', room: 'Daring' },
];

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
