/**
 * Faktor skala halaman (CSS `zoom` di body untuk monitor lebar).
 * getBoundingClientRect() & clientX/Y memakai piksel layar, sedangkan `left/top/translate`
 * di dalam body memakai piksel CSS yang belum dikali zoom, jadi koordinat perlu dibagi faktor ini.
 */
export function pageZoom(): number {
  const body = document.body;
  if (!body || !body.offsetWidth) return 1;
  const ratio = body.getBoundingClientRect().width / body.offsetWidth;
  return ratio > 0.5 && ratio < 4 ? ratio : 1;
}

/** Faktor skala efektif suatu elemen (layar / piksel CSS). */
export function zoomOf(el: HTMLElement): number {
  if (!el.offsetWidth) return pageZoom();
  const ratio = el.getBoundingClientRect().width / el.offsetWidth;
  return ratio > 0.5 && ratio < 4 ? ratio : 1;
}
