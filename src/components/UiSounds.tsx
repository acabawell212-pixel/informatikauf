import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Suara antarmuka (klik & hover) tanpa file audio: nada disintesis langsung dengan Web Audio API,
 * jadi tetap ringan dan tidak menambah aset yang perlu diunduh. Semua nada diambil dari satu
 * tangga nada pentatonik supaya hover dan klik terdengar nyambung dan enak didengar.
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
const MAX_VOICES = 24; // batas nada berbunyi bersamaan agar tidak berisik dan boros

/* ---------- Nada UI: satu keluarga suara ----------
   Hover = nada kaca/marimba yang naik satu derajat setiap kontrol baru, tombol = nada kayu
   satu oktaf di bawahnya, jadi hover dan klik terdengar nyambung, bukan dua suara asing. */
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19]; // A mayor pentatonik (A, B, C#, E, F#) sampai ±2 oktaf
const ROOT = 880; // A5 untuk hover; tombol berbunyi satu oktaf di bawahnya (A4)
const PHRASE_GAP = 1100; // diam lebih lama dari ini: tangga nada kembali ke derajat pertama
const scaleFreq = (step: number) => ROOT * Math.pow(2, SCALE[step % SCALE.length] / 12);

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
let noise: AudioBuffer | null = null;
let lastHovered: Element | null = null;
let lastHoverAt = 0;
let lastPressAt = 0;
let noteStep = 0; // derajat tangga nada yang sedang dipakai
let noteStepAt = 0; // kapan nada terakhir berbunyi (untuk memutus frasa)

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

/** Sampel noise singkat (dibuat sekali) untuk transien "klik" tombol. */
function noiseFor(ctx: AudioContext) {
  if (noise) return noise;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * 0.06));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  noise = buffer;
  return buffer;
}

/** Letupan noise sangat singkat: yang bikin suara tombol terasa fisik, bukan sekadar nada. */
function clickNoise(ctx: AudioContext, at: number, gain: number, freq: number) {
  if (!master) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseFor(ctx);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(freq, at);
  band.Q.value = 0.9;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.003);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.055);
  src.connect(band);
  band.connect(amp);
  amp.connect(master);
  voices += 1;
  src.onended = () => {
    voices = Math.max(0, voices - 1);
    src.disconnect();
    band.disconnect();
    amp.disconnect();
  };
  src.start(at);
  src.stop(at + 0.07);
}

/** Nada hover: kaca/marimba — partial atas lebih tipis dan lebih cepat meredup. */
function bellNote(ctx: AudioContext, freq: number, at: number, gain: number, dur: number) {
  voice(ctx, { type: 'sine', from: freq, at, dur, gain, attack: 0.004 });
  voice(ctx, { type: 'sine', from: freq * 2.01, at, dur: dur * 0.55, gain: gain * 0.3, attack: 0.003 });
  voice(ctx, { type: 'sine', from: freq * 2.98, at, dur: dur * 0.3, gain: gain * 0.09, attack: 0.002 });
}

/** Nada tombol: kayu hangat + klik noise; di layar sentuh dibuat lebih tebal. */
function pluckNote(ctx: AudioContext, freq: number, at: number, touch: boolean) {
  const gain = touch ? 0.075 : 0.055;
  const dur = touch ? 0.24 : 0.17;
  voice(ctx, { type: 'triangle', from: freq, to: freq * 0.94, at, dur, gain, attack: 0.005 });
  voice(ctx, { type: 'sine', from: freq * 2.01, to: freq * 1.9, at, dur: dur * 0.55, gain: gain * 0.3, attack: 0.003 });
  voice(ctx, { type: 'sine', from: freq * 3.02, to: freq * 2.8, at: at + 0.008, dur: dur * 0.3, gain: gain * 0.12, attack: 0.002 });
  clickNoise(ctx, at, touch ? 0.05 : 0.032, touch ? 1850 : 2500);
}

/** Derajat nada berikutnya: naik satu langkah, kembali ke bawah setelah frasa selesai (jeda). */
function advanceNote(now: number, advance: boolean) {
  if (now - noteStepAt > PHRASE_GAP) noteStep = 0;
  else if (advance) noteStep = (noteStep + 1) % SCALE.length;
  if (advance) noteStepAt = now;
  return noteStep;
}

/** Hover: naik satu derajat tiap kontrol baru, jadi terasa seperti menaiki tangga nada. */
function playHoverSound() {
  const ctx = audio();
  // Browser menahan suara sebelum ada interaksi: jangan mengantre, cukup diam sampai pengguna mengklik.
  if (!ctx || ctx.state !== 'running') return;
  const now = performance.now();
  if (now - lastHoverAt < HOVER_GAP || voices >= MAX_VOICES) return;
  lastHoverAt = now;
  // detune acak sangat tipis supaya tidak terdengar seperti mesin
  const freq = scaleFreq(advanceNote(now, true)) * (1 + (Math.random() - 0.5) * 0.006);
  bellNote(ctx, freq, ctx.currentTime + 0.004, 0.032, 0.24);
}

/** Tekan: nada kayu satu oktaf di bawah nada hover + klik noise. */
function playPressSound(touch = false) {
  const ctx = audio();
  if (!ctx) return;
  unlockAudio();
  const now = performance.now();
  if (now - lastPressAt < PRESS_GAP || voices >= MAX_VOICES) return;
  lastPressAt = now;
  // Mouse: memakai nada kontrol yang sedang di-hover (terasa "mengunci" pilihan).
  // Layar sentuh: setiap ketuk naik satu derajat karena di HP tidak ada hover.
  const step = advanceNote(now, touch);
  const freq = scaleFreq(step) * 0.5 * (1 + (Math.random() - 0.5) * 0.008);
  pluckNote(ctx, freq, ctx.currentTime + 0.004, touch);
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
