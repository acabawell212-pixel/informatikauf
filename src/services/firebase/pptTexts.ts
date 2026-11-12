import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ADMIN_EMAILS, firebaseReady } from './config';
import { getFirebase } from './client';

/**
 * Teks template PPT yang diubah admin disimpan di satu dokumen Firestore:
 *   pptTemplate/main = { texts: { 'cover.title': '...', ... }, updatedAt, updatedBy }
 * Semua orang boleh membaca; hanya ADMIN_EMAILS yang boleh menulis (lihat firestore.rules).
 */
export type PptTexts = Record<string, string>;

const DOC_PATH = ['pptTemplate', 'main'] as const;

export function isAdminUser(user: User | null | undefined): boolean {
  return Boolean(user?.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));
}

/** Pengguna yang sedang login (undefined = masih memuat, null = belum login). */
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    if (!firebaseReady) { setUser(null); return; }
    let unsub = () => {};
    let alive = true;
    getFirebase().then(async ({ auth }) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      if (alive) unsub = onAuthStateChanged(auth, setUser);
    }).catch(() => setUser(null));
    return () => { alive = false; unsub(); };
  }, []);
  return user;
}

/** Baca teks tersimpan. Gagal (offline / aturan belum dipasang) = pakai teks bawaan. */
export async function loadPptTexts(): Promise<PptTexts> {
  if (!firebaseReady) return {};
  try {
    const { db } = await getFirebase();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, ...DOC_PATH));
    const texts = snap.exists() ? snap.data().texts : null;
    if (!texts || typeof texts !== 'object') return {};
    return Object.fromEntries(Object.entries(texts).filter(([, v]) => typeof v === 'string')) as PptTexts;
  } catch {
    return {};
  }
}

/**
 * Gambar slide (dipilih admin dari galeri HP/laptop) disimpan sebagai JPEG data URL,
 * satu dokumen per gambar: pptImages/{id} = { dataUrl, updatedAt, updatedBy }.
 */
export type PptImages = Record<string, string>;

export async function loadPptImages(): Promise<PptImages> {
  if (!firebaseReady) return {};
  try {
    const { db } = await getFirebase();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'pptImages'));
    const images: PptImages = {};
    snap.forEach((d) => {
      const url = d.data().dataUrl;
      if (typeof url === 'string' && url.startsWith('data:image/')) images[d.id] = url;
    });
    return images;
  } catch {
    return {};
  }
}

/** Simpan gambar yang berubah; nilai kosong = hapus gambar (kembali ke kotak kosong). */
export async function savePptImages(changes: PptImages, email: string): Promise<void> {
  const { db } = await getFirebase();
  const { deleteDoc, doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  await Promise.all(Object.entries(changes).map(([id, dataUrl]) => (dataUrl
    ? setDoc(doc(db, 'pptImages', id), { dataUrl, updatedAt: serverTimestamp(), updatedBy: email })
    : deleteDoc(doc(db, 'pptImages', id)))));
}

export async function savePptTexts(texts: PptTexts, email: string): Promise<void> {
  const { db } = await getFirebase();
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, ...DOC_PATH), { texts, updatedAt: serverTimestamp(), updatedBy: email });
}
