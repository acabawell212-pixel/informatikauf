// Tempel isi `firebaseConfig` dari Firebase Console (Project settings -> Your apps) di sini.
// Nilai ini memang publik; keamanan dijaga oleh aturan Firestore (lihat firestore.rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyCAZmhqVvlGPn8OCUG1E4_yIEDcKoWly_4',
  authDomain: 'informatika2026-f891a.firebaseapp.com',
  projectId: 'informatika2026-f891a',
  storageBucket: 'informatika2026-f891a.firebasestorage.app',
  messagingSenderId: '120556102311',
  appId: '1:120556102311:web:e3e0140c661a3100c1f182',
};

// Hanya akun Google ini yang boleh membuka kotak masuk (harus sama dengan firestore.rules).
export const ADMIN_EMAILS = ['informatikauf2026@gmail.com', 'acabawell212@gmail.com'];

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
