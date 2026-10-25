// Sosyal görsel şablonları. Her şablon bir HTML gövdesi döndürür; çerçeve, fontlar, katkı
// ızgarası motifi ve metin sığdırma `page()` içinde ortaktır. Ölçüler `--u` birimiyle yazılır
// (kısa kenarın %1'i), böylece aynı şablon 800×320'den 2560×1440'a kadar her boyutta çalışır.
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { palette as P } from './palette.ts';
import type { Size } from './sizes.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fontUrl = (f: string) => pathToFileURL(resolve(root, 'brand/fonts', f)).href;
const markSvg = (name: string) => readFileSync(resolve(root, 'brand/logo', name), 'utf8');

export type Theme = 'light' | 'dark';
export type Shape = 'square' | 'portrait' | 'tall' | 'landscape' | 'wide' | 'strip';

export function shapeOf({ w, h }: Size): Shape {
  const r = w / h;
  if (r >= 4) return 'strip';
  if (r >= 2.4) return 'wide';
  if (r > 1.2) return 'landscape';
  if (r >= 0.95) return 'square';
  if (r >= 0.7) return 'portrait';
  return 'tall';
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- katkı ızgarası motifi

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (s: string) => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);

type MotifOpts = {
  /** Odak noktası, çerçeve oranı olarak (0–1). Hücreler buradan uzaklaştıkça seyrelir. */
  focus: [number, number];
  /** Odaktan etki yarıçapı, kısa kenar oranı olarak. */
  spread: number;
  cell: number;
  seed: number;
  theme: Theme;
};

export function motif(w: number, h: number, o: MotifOpts) {
  const gap = Math.round(o.cell * 0.22);
  const step = o.cell + gap;
  const cols = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / step) + 1;
  const r = rng(o.seed);
  const short = Math.min(w, h);
  const fx = o.focus[0] * w;
  const fy = o.focus[1] * h;
  const empty = o.theme === 'dark' ? 'rgba(230,238,232,0.07)' : 'rgba(23,50,41,0.06)';
  const levels = [empty, o.theme === 'dark' ? '#2C5A45' : P.mist, P.sprout, o.theme === 'dark' ? P.mossOnDark : P.moss, P.pollen];
  const rx = Math.round(o.cell * 0.22);
  const out: string[] = [];
  for (let c = 0; c < cols; c++) {
    for (let rr = 0; rr < rows; rr++) {
      const x = c * step;
      const y = rr * step;
      const d = Math.hypot(x + o.cell / 2 - fx, y + o.cell / 2 - fy) / (short * o.spread);
      if (d > 1.15) continue; // uzaktaki hücreler hiç çizilmez: metnin arkası temiz kalır
      const heat = Math.max(0, 1 - d) * (0.55 + r() * 0.75);
      let lvl = 0;
      if (heat > 0.25) lvl = 1;
      if (heat > 0.45) lvl = 2;
      if (heat > 0.68) lvl = 3;
      if (heat > 0.92 && r() > 0.45) lvl = 4; // polen hücreleri seyrek: ustaların katkısı
      const fade = d > 0.85 ? ` opacity="${(1 - (d - 0.85) / 0.3).toFixed(2)}"` : '';
      out.push(`<rect x="${x}" y="${y}" width="${o.cell}" height="${o.cell}" rx="${rx}" fill="${levels[lvl]}"${fade}/>`);
    }
  }
  return `<svg class="motif" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${out.join('')}</svg>`;
}

/** Gerçek veriden katkı şeridi: her değer bir gün; 7 satır. */
export function contributionStrip(values: number[], cell: number, theme: Theme) {
  const gap = Math.round(cell * 0.22);
  const max = Math.max(1, ...values);
  const colors = [theme === 'dark' ? 'rgba(230,238,232,0.08)' : P.mist, P.sprout, theme === 'dark' ? P.mossOnDark : P.moss, P.pine];
  if (theme === 'dark') colors[3] = P.pollen;
  const weeks = Math.ceil(values.length / 7);
  const w = weeks * (cell + gap) - gap;
  const h = 7 * (cell + gap) - gap;
  const rects = values.map((v, i) => {
    const lvl = v === 0 ? 0 : Math.min(3, Math.ceil((v / max) * 3));
    const x = Math.floor(i / 7) * (cell + gap);
    const y = (i % 7) * (cell + gap);
    return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="${Math.round(cell * 0.22)}" fill="${colors[lvl]}"/>`;
  });
  return `<svg class="strip-grid" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${rects.join('')}</svg>`;
}

// ---------------------------------------------------------------- ortak sayfa

type PageOpts = {
  size: Size;
  theme: Theme;
  body: string;
  motif?: Partial<Omit<MotifOpts, 'theme'>> | false;
  footer?: boolean;
  transparent?: boolean;
  seed: number;
};

const defaultFocus: Record<Shape, [number, number]> = {
  square: [1, 0],
  portrait: [1, 0],
  tall: [1, 0.08],
  landscape: [1, 0],
  wide: [1, 0.5],
  strip: [1, 0.5],
};

export function page(o: PageOpts) {
  const { w, h } = o.size;
  const shape = shapeOf(o.size);
  const u = Math.min(w, h) / 100;
  const safe = o.size.safe ?? { x: 0, y: 0 };
  const m =
    o.motif === false
      ? ''
      : motif(w, h, {
          focus: defaultFocus[shape],
          spread: shape === 'strip' || shape === 'wide' ? 2.2 : 0.95,
          cell: Math.round(Math.max(14, u * (shape === 'strip' ? 13 : 6.4))),
          seed: o.seed,
          theme: o.theme,
          ...o.motif,
        });
  const footer =
    o.footer === false
      ? ''
      : `<footer class="foot"><span class="foot-mark">${markSvg('koina-mark-solid.svg')}</span><span>koina.dev</span><span class="foot-handle">@koinadev</span></footer>`;

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Bricolage'; src: url('${fontUrl('BricolageGrotesque.ttf')}') format('truetype'); font-weight: 200 800; font-stretch: 75% 100%; }
@font-face { font-family: 'Instrument'; src: url('${fontUrl('InstrumentSans.ttf')}') format('truetype'); font-weight: 400 700; font-stretch: 75% 100%; }
:root {
  --u: ${u}px; --w: ${w}px; --h: ${h}px;
  --pine: ${P.pine}; --moss: ${P.moss}; --sprout: ${P.sprout}; --pollen: ${P.pollen};
  --marble: ${P.marble}; --mist: ${P.mist};
  --bg: ${o.theme === 'dark' ? P.pineDeep : P.marble};
  --fg: ${o.theme === 'dark' ? P.marbleOnDark : P.pine};
  --muted: ${o.theme === 'dark' ? 'rgba(230,238,232,0.72)' : 'rgba(23,50,41,0.72)'};
  --accent: ${o.theme === 'dark' ? P.mossOnDark : P.moss};
  --line: ${o.theme === 'dark' ? 'rgba(230,238,232,0.16)' : 'rgba(23,50,41,0.14)'};
  --pad: calc(var(--u) * ${shape === 'strip' ? 14 : shape === 'wide' ? 10 : 7});
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: var(--w); height: var(--h); overflow: hidden; }
body { background: ${o.transparent ? 'transparent' : 'var(--bg)'}; color: var(--fg); font-family: 'Instrument', sans-serif; -webkit-font-smoothing: antialiased; }
.frame { position: relative; width: var(--w); height: var(--h); }
.motif { position: absolute; inset: 0; -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 94%); mask-image: linear-gradient(to bottom, #000 72%, transparent 94%); }
.content { position: absolute; inset: calc(${safe.y}px + var(--pad)) calc(${safe.x}px + var(--pad)); display: flex; flex-direction: column; gap: calc(var(--u) * 3); }
.foot { position: absolute; left: calc(${safe.x}px + var(--pad)); right: calc(${safe.x}px + var(--pad)); bottom: calc(${safe.y}px + var(--pad) * 0.7);
  display: flex; align-items: center; gap: calc(var(--u) * 1.6); font: 600 calc(var(--u) * 2.6)/1 'Instrument'; color: var(--fg); }
.foot-mark svg { width: calc(var(--u) * 4); height: auto; display: block; }
.foot-handle { margin-left: auto; color: var(--muted); font-weight: 500; }
.has-foot .content { bottom: calc(${safe.y}px + var(--pad) + var(--u) * 5); }

h1, .display { font-family: 'Bricolage'; font-weight: 750; letter-spacing: -0.035em; line-height: 0.98; font-optical-sizing: auto; text-wrap: balance; }
h1 { font-size: calc(var(--u) * 11); }
.lede { font-size: calc(var(--u) * 3.6); line-height: 1.38; color: var(--muted); max-width: 34ch; text-wrap: pretty; }
.grow { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: calc(var(--u) * 3); }
.fit { overflow: hidden; }

.pill { align-self: flex-start; display: inline-flex; align-items: center; gap: calc(var(--u) * 1.2); padding: calc(var(--u) * 1.1) calc(var(--u) * 2.2);
  border-radius: calc(var(--u) * 1.4); font: 650 calc(var(--u) * 2.8)/1 'Instrument'; background: var(--sprout); color: var(--pine); }
.pill.pollen { background: var(--pollen); }
.pill.outline { background: transparent; border: calc(var(--u) * 0.25) solid var(--line); color: var(--fg); }
.dot { width: calc(var(--u) * 1.5); height: calc(var(--u) * 1.5); border-radius: calc(var(--u) * 0.35); background: var(--pine); }
.meta { display: flex; flex-wrap: wrap; gap: calc(var(--u) * 1.4) calc(var(--u) * 4); font: 600 calc(var(--u) * 3.4)/1.2 'Instrument'; }
.meta span { display: flex; flex-direction: column; gap: calc(var(--u) * 0.8); }
.meta small { font-size: 0.66em; font-weight: 500; color: var(--muted); }

/* geniş ve şerit formatlarda içerik yatay akar */
.shape-wide h1, .shape-strip h1 { font-size: calc(var(--u) * 16); }
.shape-landscape h1 { font-size: calc(var(--u) * 10.5); }
.shape-tall h1 { font-size: calc(var(--u) * 12.5); }
${pageExtraCss}
</style></head><body><div class="frame shape-${shape} ${o.footer === false ? '' : 'has-foot'}">${m}${o.body}${footer}</div>
<script>
// Başlık kutusuna sığana kadar küçült. Kutunun yüksekliği flex'ten gelir.
window.__fit = async () => {
  await document.fonts.ready;
  for (const el of document.querySelectorAll('[data-fit]')) {
    const box = el.closest('.fit') || el.parentElement;
    let size = parseFloat(getComputedStyle(el).fontSize);
    const min = size * 0.4;
    let guard = 60;
    // Sıkı satır aralığında harflerin mürekkebi kutudan ~%10 taşar; bu taşma sayılmaz.
    const over = () => box.scrollHeight - box.clientHeight > size * 0.15 || el.scrollWidth > el.clientWidth + 1;
    while (guard-- > 0 && size > min && over()) {
      size *= 0.95; el.style.fontSize = size + 'px';
    }
  }
};
</script></body></html>`;
}

let pageExtraCss = '';
export const registerCss = (css: string) => {
  pageExtraCss += css;
};

export { esc };
