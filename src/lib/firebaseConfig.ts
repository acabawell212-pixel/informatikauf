// Tempel isi `firebaseConfig` dari Firebase Console (Project settings -> Your apps) di sini.
// Nilai ini memang publik; keamanan dijaga oleh aturan Firestore (lihat firestore.rules).
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Hanya akun Google ini yang boleh membuka kotak masuk (harus sama dengan firestore.rules).
export const ADMIN_EMAILS = ['informatikauf2026@gmail.com', 'acabawell212@gmail.com'];

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
