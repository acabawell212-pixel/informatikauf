import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Inbox, LogOut, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { ADMIN_EMAILS, firebaseReady } from '../lib/firebaseConfig';
import { getFirebase } from '../lib/firebase';

type Msg = { id: string; name: string; message: string; read: boolean; at: Date | null };
type Filter = 'all' | 'unread';

const fmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

/** Kotak masuk pesan. Hanya akun Google di ADMIN_EMAILS yang bisa membacanya (dijaga juga oleh aturan Firestore). */
export default function Admin() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const allowed = Boolean(user?.email && user.emailVerified && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  useEffect(() => {
    document.title = 'Kotak Kritik — Informatika Faletehan';
    if (!firebaseReady) { setUser(null); return; }
    let unsub = () => {};
    getFirebase().then(async ({ auth }) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(auth, (next) => setUser(next));
    }).catch(() => setUser(null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!allowed) { setMessages([]); return; }
    let unsub = () => {};
    getFirebase().then(async ({ db }) => {
      const { collection, onSnapshot, orderBy, query } = await import('firebase/firestore');
      unsub = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
        setError('');
        setMessages(snap.docs.map((d) => {
          const v = d.data();
          return { id: d.id, name: String(v.name ?? ''), message: String(v.message ?? ''), read: Boolean(v.read), at: v.createdAt?.toDate?.() ?? null };
        }));
      }, () => setError('Tidak bisa membaca kritik. Pastikan aturan Firestore sudah dipasang dan akunmu terdaftar sebagai admin.'));
    });
    return () => unsub();
  }, [allowed]);

  const login = async () => {
    setBusy(true);
    setError('');
    try {
      const { auth } = await getFirebase();
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/unauthorized-domain'
          ? 'Domain situs belum ditambahkan di Firebase (Authentication → Settings → Authorized domains).'
          : 'Login gagal. Coba lagi.');
      }
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    const { auth } = await getFirebase();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  const setRead = async (id: string, read: boolean) => {
    const { db } = await getFirebase();
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'messages', id), { read });
  };

  const remove = async (id: string) => {
    const { db } = await getFirebase();
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'messages', id));
    setConfirmId(null);
  };

  const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages]);
  const shown = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  return (
    <main className="admin">
      <div className="admin-wrap">
        <header className="admin-head">
          <a className="admin-back" href="#/"><ArrowLeft size={16} /> Kembali ke situs</a>
          {allowed && (
            <div className="admin-user">
              <span>{user?.email}</span>
              <button type="button" onClick={logout}><LogOut size={14} /> Keluar</button>
            </div>
          )}
        </header>

        <h1><Inbox size={26} /> Kotak Kritik</h1>

        {!firebaseReady && (
          <div className="admin-card">
            <h2>Firebase belum dikonfigurasi</h2>
            <p>Isi <code>src/lib/firebaseConfig.ts</code> dengan config dari Firebase Console, lalu deploy ulang.</p>
          </div>
        )}

        {firebaseReady && user === undefined && <p className="admin-muted">Memuat…</p>}

        {firebaseReady && user === null && (
          <div className="admin-card admin-login">
            <h2>Khusus admin</h2>
            <p>Masuk dengan akun Google admin untuk membaca kritik dan saran yang dikirim lewat situs.</p>
            <button className="admin-btn" type="button" onClick={login} disabled={busy}>{busy ? 'Membuka Google…' : 'Masuk dengan Google'}</button>
            {error && <p className="admin-error">{error}</p>}
          </div>
        )}

        {firebaseReady && user && !allowed && (
          <div className="admin-card">
            <h2>Akun ini tidak punya akses</h2>
            <p>Kamu masuk sebagai <b>{user.email}</b>. Akun ini tidak terdaftar sebagai admin.</p>
            <button className="admin-btn" type="button" onClick={logout}>Keluar dan ganti akun</button>
          </div>
        )}

        {allowed && (
          <>
            <div className="admin-bar">
              <div className="admin-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>Semua <b>{messages.length}</b></button>
                <button type="button" role="tab" aria-selected={filter === 'unread'} className={filter === 'unread' ? 'on' : ''} onClick={() => setFilter('unread')}>Belum dibaca <b>{unread}</b></button>
              </div>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {!error && shown.length === 0 && <p className="admin-empty">{filter === 'unread' ? 'Semua pesan sudah dibaca. 🎉' : 'Belum ada kritik masuk.'}</p>}

            <ul className="admin-list">
              {shown.map((m) => (
                <li key={m.id} className={`admin-msg${m.read ? '' : ' is-unread'}`}>
                  <div className="admin-msg-top">
                    <div>
                      <strong>{m.name}</strong>

                    </div>
                    <time>{m.at ? fmt.format(m.at) : 'baru saja'}</time>
                  </div>
                  <p>{m.message}</p>
                  <div className="admin-actions">

                    <button className="admin-btn small ghost" type="button" onClick={() => setRead(m.id, !m.read)}><Check size={14} /> {m.read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}</button>
                    {confirmId === m.id ? (
                      <>
                        <button className="admin-btn small danger" type="button" onClick={() => remove(m.id)}>Ya, hapus</button>
                        <button className="admin-btn small ghost" type="button" onClick={() => setConfirmId(null)}>Batal</button>
                      </>
                    ) : (
                      <button className="admin-btn small ghost" type="button" onClick={() => setConfirmId(m.id)}><Trash2 size={14} /> Hapus</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
