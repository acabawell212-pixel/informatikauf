/**
 * Perkecil foto dari galeri/kamera HP menjadi JPEG data URL yang cukup kecil
 * untuk disimpan langsung di dokumen Firestore (batas dokumen 1 MB).
 */
const MAX_SIDE = 1400;
const MAX_BYTES = 700_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gambar tidak bisa dibaca')); };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File ini bukan gambar');
  const img = await loadImage(file);
  let scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));

  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Browser tidak mendukung pengolahan gambar');
    ctx.fillStyle = '#fff'; // PNG transparan jadi latar putih, bukan hitam
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', attempt < 3 ? 0.82 - attempt * 0.12 : 0.6);
    if (dataUrl.length <= MAX_BYTES) return dataUrl;
    if (attempt >= 2) scale *= 0.75;
  }
  throw new Error('Gambar terlalu besar, coba pilih foto lain');
}
