import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Suara antarmuka (klik & hover) tanpa file audio: nada disintesis langsung dengan Web Audio API,
 * jadi tetap ringan dan tidak menambah aset yang perlu diunduh. Volumenya dibuat lembut mengikuti
 * tema fantasy situs (teal & emas).
 */

const STORAGE_KEY = 'faletehan-ui-sound';

/** Kontrol yang berbunyi halus saat kursor mampir (tidak berlaku untuk layar sentuh). */
const HOVER_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  '[role="tab"]',
  'summary',
  '.gallery-filter',
  '.schedule-day-tab',
  '.filter-pill',
].join(', ');

/** Kontrol yang berbunyi saat ditekan, disentuh, atau diaktifkan lewat keyboard. */
const PRESS_SELECTOR = [
  HOVER_SELECTOR,
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  '.gallery-card',
  '.course-row',
].join(', ');

const HOVER_GAP = 45; // jeda minimum antar suara hover (ms) supaya tidak beruntun
const PRESS_GAP = 70; // jeda minimum antar suara tekan (ms)
const MAX_VOICES = 8; // batas nada berbunyi bersamaan agar tidak berisik dan boros

/** Elemen mana pun bisa dibisukan dengan atribut data-sound="off" (termasuk anak-anaknya). */
const MUTE_SELECTOR = '[data-sound="off"]';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
type AudioSessionSupport = Navigator & { audioSession?: { type: string } };

/** Layar sentuh tidak punya kursor, jadi tidak ada suara hover: labelnya disesuaikan. */
const touchPrimary = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches === false;

/**
 * iOS membungkam Web Audio saat saklar silent/ringer mati, kecuali sesi audio halaman
 * dinyatakan sebagai "playback" (Safari 16.4+). Android tidak terpengaruh.
 */
function preparePlaybackSession() {
  const nav = navigator as AudioSessionSupport;
  if (nav.audioSession && nav.audioSession.type !== 'playback') nav.audioSession.type = 'playback';
}

let context: AudioContext | null = null;
let master: GainNode | null = null;
let voices = 0;
let lastHovered: Element | null = null;
let lastHoverAt = 0;
let lastPressAt = 0;

function audio(): AudioContext | null {
  if (context) return context;
  preparePlaybackSession();
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    return null;
  }
  master = context.createGain();
  master.gain.value = 0.85; // volume keseluruhan: cukup terdengar, tidak mengagetkan
  master.connect(context.destination);
  return context;
}

/** Nyalakan audio di dalam gesture pengguna (syarat iOS & Android) dan pulihkan bila tertidur. */
function unlockAudio() {
  preparePlaybackSession();
  const ctx = audio();
  if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => { /* tunggu gesture berikutnya */ });
}

type VoiceOptions = {
  type: OscillatorType;
  from: number;
  to?: number;
  at: number;
  dur: number;
  gain: number;
  attack?: number;
};

/** Satu nada pendek dengan selubung (envelope) cepat: naik sekejap lalu meredup. */
function voice(ctx: AudioContext, options: VoiceOptions) {
  if (!master) return;
  const { type, from, to = from, at, dur, gain, attack = 0.006 } = options;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(master);
  voices += 1;
  osc.onended = () => {
    voices = Math.max(0, voices - 1);
    osc.disconnect();
    amp.disconnect();
  };
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Hover: "tick" pendek dan tipis, nadanya sedikit berubah tiap kali agar terdengar alami. */
function playHoverSound() {
  const ctx = audio();
  // Browser menahan suara sebelum ada interaksi: jangan mengantre, cukup diam sampai pengguna mengklik.
  if (!ctx || ctx.state !== 'running') return;
  const now = performance.now();
  if (now - lastHoverAt < HOVER_GAP || voices >= MAX_VOICES) return;
  lastHoverAt = now;
  const at = ctx.currentTime + 0.004;
  const base = 940 + (Math.random() - 0.5) * 70;
  voice(ctx, { type: 'sine', from: base, to: base * 0.86, at, dur: 0.075, gain: 0.026, attack: 0.004 });
  voice(ctx, { type: 'triangle', from: base * 2, to: base * 1.72, at, dur: 0.05, gain: 0.008, attack: 0.004 });
}

/** Tekan: "tap" hangat tiga nada (nada tinggi memberi kesan emas/keramik). */
function playPressSound(touch = false) {
  const ctx = audio();
  if (!ctx) return;
  unlockAudio();
  const now = performance.now();
  if (now - lastPressAt < PRESS_GAP || voices >= MAX_VOICES) return;
  lastPressAt = now;
  const at = ctx.currentTime + 0.004;
  const base = 380 + (Math.random() - 0.5) * 26;
  // Speaker HP kecil: ketukan dari layar sentuh dibuat lebih tebal & sedikit lebih panjang.
  const scale = touch ? 1.7 : 1;
  const dur = touch ? 0.19 : 0.15;
  voice(ctx, { type: 'triangle', from: base, to: base * 0.72, at, dur, gain: 0.07 * scale, attack: 0.005 });
  voice(ctx, { type: 'sine', from: base * 2.55, to: base * 2, at, dur: dur * 0.6, gain: 0.028 * scale, attack: 0.003 });
  voice(ctx, { type: 'sine', from: base * 4.1, to: base * 3.4, at: at + 0.01, dur: 0.06, gain: 0.011 * scale, attack: 0.003 });
}

function soundTarget(target: EventTarget | null, selector: string): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>(selector);
  return el && !el.closest(MUTE_SELECTOR) ? el : null;
}

function isUnavailable(el: HTMLElement) {
  return el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true';
}

function readPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true; // penyimpanan browser bisa ditolak; suara tetap aktif secara bawaan
  }
}

/** Suara klik & hover untuk seluruh UI, plus tombol pembisu kecil di sudut layar. */
export function UiSounds() {
  const [enabled, setEnabled] = useState(readPreference);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // AudioContext baru boleh menyala setelah interaksi pertama (kebijakan autoplay browser).
  // Beberapa browser HP (iOS) lebih yakin bila unlock datang dari sentuhan/selesai-klik, jadi
  // beberapa jenis event sekaligus dicoba; resume ini juga memulihkan audio yang tertidur.
  useEffect(() => {
    const unlock = () => {
      if (!enabledRef.current) return;
      unlockAudio();
    };
    const types: Array<keyof DocumentEventMap> = ['pointerdown', 'touchend', 'click', 'keydown'];
    types.forEach((type) => document.addEventListener(type, unlock, { capture: true }));
    return () => types.forEach((type) => document.removeEventListener(type, unlock, { capture: true }));
  }, []);

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      if (!enabledRef.current || event.pointerType === 'touch') return;
      const target = soundTarget(event.target, HOVER_SELECTOR);
      // Masih di kontrol yang sama (mis. pindah dari teks tombol ke ikonnya): jangan berbunyi dua kali.
      if (target === lastHovered) return;
      // Kursor pindah ke elemen lain: pointerover juga datang dari elemen non-kontrol, jadi ini
      // sekaligus menandai bahwa kursor sudah keluar dari kontrol sebelumnya.
      lastHovered = target;
      if (!target) return;
      playHoverSound();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = soundTarget(event.target, PRESS_SELECTOR);
      if (!target || isUnavailable(target)) return;
      // Ketukan di layar sentuh terdengar lebih tebal daripada klik mouse.
      playPressSound(event.pointerType !== 'mouse');
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current || event.repeat) return;
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      const target = soundTarget(event.target, PRESS_SELECTOR);
      if (!target || isUnavailable(target)) return;
      playPressSound();
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    document.addEventListener('keydown', onKeyDown, { capture: true });
    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      lastHovered = null;
    };
  }, []);

  const toggle = () => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      // Pilihan tetap berlaku untuk sesi ini walau penyimpanan tidak bisa ditulis.
    }
    if (next) playPressSound(touchPrimary); // contoh suara saat suara dinyalakan kembali
  };

  const soundName = touchPrimary ? 'suara ketukan' : 'suara klik dan hover';

  return (
    <button
      type="button"
      className={`ui-sound-toggle${enabled ? ' is-on' : ''}`}
      aria-pressed={enabled}
      aria-label={enabled ? `Matikan ${soundName} antarmuka` : `Nyalakan ${soundName} antarmuka`}
      data-hint={enabled ? `Matikan ${soundName}.` : `Nyalakan ${soundName}.`}
      data-sound="off"
      onClick={toggle}
    >
      {enabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
      <span className="ui-sound-label">{enabled ? 'Suara' : 'Bisu'}</span>
    </button>
  );
}
