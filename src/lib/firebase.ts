import { firebaseConfig, firebaseReady } from './firebaseConfig';

/** Firebase dimuat malas (dynamic import) supaya tidak menambah berat halaman utama. */
let cached: Promise<{
  db: import('firebase/firestore').Firestore;
  auth: import('firebase/auth').Auth;
}> | null = null;

export function getFirebase() {
  if (!firebaseReady) return Promise.reject(new Error('Firebase belum dikonfigurasi'));
  if (!cached) {
    cached = (async () => {
      const [{ initializeApp }, { getFirestore }, { getAuth }] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore'),
        import('firebase/auth'),
      ]);
      const app = initializeApp(firebaseConfig);
      return { db: getFirestore(app), auth: getAuth(app) };
    })();
  }
  return cached;
}
