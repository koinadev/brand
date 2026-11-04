// Sosyal görsel şablonları. Her şablon bir HTML gövdesi döndürür; çerçeve, fontlar, katkı
// ızgarası motifi, el çizimi vurgular ve metin sığdırma `page()` içinde ortaktır. Ölçüler `--u` birimiyle yazılır
// (kısa kenarın %1'i), böylece aynı şablon 800×320'den 2560×1440'a kadar her boyutta çalışır.
import { pathToFileURL } from 'node:url';
import { palette as P, fonts as F, logoSvg } from './palette.ts';
import type { Size } from './sizes.ts';

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
  // Seviyeler: boş, lila, soluk mavi, mavi, sarı. Sarı en seyrek olanı: ustaların katkısı.
  const levels =
    o.theme === 'dark'
      ? ['rgba(251,250,247,0.06)', 'rgba(140,151,240,0.14)', 'rgba(51,65,196,0.6)', P.link, P.primary]
      : ['rgba(27,31,59,0.05)', P.tint, 'rgba(51,65,196,0.35)', P.link, P.primary];
  const rx = cellRadius(o.cell);
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
      if (heat > 0.92 && r() > 0.45) lvl = 4; // sarı hücreler seyrek
      const fade = d > 0.85 ? ` opacity="${(1 - (d - 0.85) / 0.3).toFixed(2)}"` : '';
      out.push(`<rect x="${x}" y="${y}" width="${o.cell}" height="${o.cell}" rx="${rx}" fill="${levels[lvl]}"${fade}/>`);
    }
  }
  return `<svg class="motif" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${out.join('')}</svg>`;
}

/** Hücre köşesi sitedeki `--k-cell-radius-svg` oranıyla aynı (28 birimlik hücrede 7). */
const cellRadius = (cell: number) => Math.round(cell * 0.25);

/** Gerçek veriden katkı şeridi: her değer bir gün; 7 satır. */
export function contributionStrip(values: number[], cell: number, theme: Theme) {
  const gap = Math.round(cell * 0.22);
  const max = Math.max(1, ...values);
  const colors =
    theme === 'dark'
      ? ['rgba(251,250,247,0.08)', 'rgba(140,151,240,0.45)', P.linkOnDark, P.primary]
      : [P.line, P.linkOnDark, P.link, P.fg];
  const weeks = Math.ceil(values.length / 7);
  const w = weeks * (cell + gap) - gap;
  const h = 7 * (cell + gap) - gap;
  const rects = values.map((v, i) => {
    const lvl = v === 0 ? 0 : Math.min(3, Math.ceil((v / max) * 3));
    const x = Math.floor(i / 7) * (cell + gap);
    const y = (i % 7) * (cell + gap);
    return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="${cellRadius(cell)}" fill="${colors[lvl]}"/>`;
  });
  return `<svg class="strip-grid" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${rects.join('')}</svg>`;
}

// ---------------------------------------------------------------- el çizimi vurgular

/** Nane yeşili kıvrım: başlık altına küçük bir el çizimi çizgi. */
export const squiggle = () =>
  `<svg class="squiggle" viewBox="0 0 120 16" aria-hidden="true"><path d="M3 10 C 13 2, 23 2, 33 9 S 53 16, 63 9 S 83 2, 93 9 S 110 14, 117 7" fill="none" stroke="${P.mint}" stroke-width="5" stroke-linecap="round"/></svg>`;

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
  const dark = o.theme === 'dark';
  const footer =
    o.footer === false
      ? ''
      : `<footer class="foot"><span class="foot-mark">${logoSvg('mark', dark)}</span><span>koina.dev</span><span class="foot-handle">@koinadev</span></footer>`;

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">${F.css.map((f) => `<link rel="stylesheet" href="${pathToFileURL(f).href}">`).join('')}<style>
:root {
  --u: ${u}px; --w: ${w}px; --h: ${h}px;
  --primary: ${P.primary}; --on-primary: ${P.onPrimary}; --live: ${P.live}; --on-live: ${P.onLive};
  --accent: ${P.accent}; --mint: ${P.mint}; --tint: ${P.tint}; --ink: ${P.ink};
  --f-sans: ${F.sans}; --f-hand: ${F.hand}; --f-mono: ${F.mono};
  --f-weight: ${F.displayWeight}; --f-track: ${F.tracking};
  --bg: ${dark ? P.fg : P.bg};
  --fg: ${dark ? P.bg : P.fg};
  --muted: ${dark ? 'rgba(251,250,247,0.72)' : P.muted};
  --link: ${dark ? P.linkOnDark : P.link};
  --line: ${dark ? 'rgba(251,250,247,0.18)' : P.line};
  --pad: calc(var(--u) * ${shape === 'strip' ? 14 : shape === 'wide' ? 10 : 7});
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: var(--w); height: var(--h); overflow: hidden; }
body { background: ${o.transparent ? 'transparent' : 'var(--bg)'}; color: var(--fg); font-family: var(--f-sans); -webkit-font-smoothing: antialiased; }
.frame { position: relative; width: var(--w); height: var(--h); }
.motif { position: absolute; inset: 0; -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 94%); mask-image: linear-gradient(to bottom, #000 72%, transparent 94%); }
.content { position: absolute; inset: calc(${safe.y}px + var(--pad)) calc(${safe.x}px + var(--pad)); display: flex; flex-direction: column; gap: calc(var(--u) * 3); }
.foot { position: absolute; left: calc(${safe.x}px + var(--pad)); right: calc(${safe.x}px + var(--pad)); bottom: calc(${safe.y}px + var(--pad) * 0.7);
  display: flex; align-items: center; gap: calc(var(--u) * 1.6); font: 700 calc(var(--u) * 2.6)/1 var(--f-sans); color: var(--fg); }
.foot-mark svg { width: calc(var(--u) * 3.6); height: auto; display: block; }
.foot-handle { margin-left: auto; color: var(--muted); font-weight: 500; }
.has-foot .content { bottom: calc(${safe.y}px + var(--pad) + var(--u) * 5); }

h1, .display { font-family: var(--f-sans); font-weight: var(--f-weight); letter-spacing: var(--f-track); line-height: 0.98; font-optical-sizing: auto; text-wrap: balance; }
h1 { font-size: calc(var(--u) * 11); }
.lede { font-size: calc(var(--u) * 3.6); line-height: 1.38; color: var(--muted); max-width: 34ch; text-wrap: pretty; }
.grow { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: calc(var(--u) * 3); }
.fit { overflow: hidden; }
.hand { font: 600 calc(var(--u) * 4.4)/1 var(--f-hand); color: var(--link); }
.squiggle { display: block; width: calc(var(--u) * 16); height: auto; flex: none; }

/* Hap etiketler: varsayılan sarı, üzerinde lacivert metin. */
.pill { align-self: flex-start; display: inline-flex; align-items: center; gap: calc(var(--u) * 1.2); padding: calc(var(--u) * 1.2) calc(var(--u) * 2.6);
  border-radius: 999px; font: 700 calc(var(--u) * 2.8)/1 var(--f-sans); background: var(--primary); color: var(--on-primary); }
.pill.live { background: var(--live); color: var(--on-live); }
.pill.mentor { background: var(--link); color: ${dark ? P.fg : '#FFFFFF'}; }
.pill.outline { background: transparent; border: calc(var(--u) * 0.25) solid var(--line); color: var(--fg); }
.dot { width: calc(var(--u) * 1.5); height: calc(var(--u) * 1.5); border-radius: 50%; background: var(--on-live); }
.meta { display: flex; flex-wrap: wrap; gap: calc(var(--u) * 1.4) calc(var(--u) * 4); font: 700 calc(var(--u) * 3.4)/1.2 var(--f-sans); }
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
