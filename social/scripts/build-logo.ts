// Koina logo üreticisi. Tek kaynak: aşağıdaki ızgara tanımı + Bricolage Grotesque.
// Çıktı: ../brand/logo/*.svg ve sitenin public/ klasörüne favicon + logo.
// Yazı SVG içinde <text> olarak değil PATH olarak gömülür; logo hiçbir yerde font beklemez.
import opentype from 'opentype.js';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette } from './palette.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = resolve(root, 'brand/logo');
mkdirSync(outDir, { recursive: true });

// 3×3 ızgarada K harfi. stem = Katılımcı (yosun), arm = Usta (polen), empty = boş katkı hücresi.
const CELL = 28;
const GAP = 6;
const RADIUS = 6; // hücre boyunun ~%22'si — marka rehberindeki köşe oranı
const SIZE = CELL * 3 + GAP * 2; // 96
type Kind = 'stem' | 'arm' | 'empty';
const grid: Kind[][] = [
  ['stem', 'empty', 'arm'],
  ['stem', 'arm', 'empty'],
  ['stem', 'empty', 'arm'],
];

type Colors = { stem: string; arm: string; empty: string | null };

function cells(c: Colors, ox = 0, oy = 0) {
  const out: string[] = [];
  grid.forEach((row, r) =>
    row.forEach((kind, col) => {
      const fill = c[kind];
      if (!fill) return;
      const x = ox + col * (CELL + GAP);
      const y = oy + r * (CELL + GAP);
      out.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="${RADIUS}" fill="${fill}"/>`);
    }),
  );
  return out.join('');
}

const svg = (w: number, h: number, body: string, title = 'Koina') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const light: Colors = { stem: palette.moss, arm: palette.pollen, empty: palette.mist };
const lightSolid: Colors = { stem: palette.moss, arm: palette.pollen, empty: null };
const inverse: Colors = { stem: palette.sprout, arm: palette.pollen, empty: 'rgba(230,238,232,0.14)' };
const mono: Colors = { stem: 'currentColor', arm: 'currentColor', empty: null };

// Wordmark: "koina", k'nin yüksekliği ızgara yüksekliğine eşit, taban çizgisi ızgaranın altı.
const fontFile = readFileSync(resolve(root, 'brand/fonts/Bricolage-Bold-Display.ttf'));
const font = opentype.parse(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));
function wordPath(text: string, x: number, fill: string) {
  const probe = font.getPath('k', 0, 0, 100);
  const kb = probe.getBoundingBox();
  const fontSize = (SIZE / (0 - kb.y1)) * 100; // k'nin üstü ızgaranın üstüne otursun
  const tracking = -0.02 * fontSize;
  let cursor = x;
  const parts: string[] = [];
  // stringToGlyphs bu fontun GSUB tablosunu desteklemiyor; "koina" için ligatür gerekmediğinden
  // karakter karakter eşlemek yeterli.
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  glyphs.forEach((g, i) => {
    const p = g.getPath(cursor, SIZE, fontSize);
    parts.push(p.toPathData(2));
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    cursor += ((g.advanceWidth ?? 0) + kern) * (fontSize / font.unitsPerEm) + tracking;
  });
  return { d: parts.join(''), width: cursor - x, fill };
}

function wordmark(c: Colors, textFill: string, bg?: string) {
  const textX = SIZE + 30;
  const w = wordPath('koina', textX, textFill);
  const width = Math.ceil(textX + w.width + 4);
  const pad = bg ? 32 : 0;
  const body =
    (bg ? `<rect width="${width + pad * 2}" height="${SIZE + pad * 2}" rx="24" fill="${bg}"/>` : '') +
    `<g transform="translate(${pad} ${pad})">${cells(c)}<path d="${w.d}" fill="${w.fill}"/></g>`;
  return svg(width + pad * 2, SIZE + pad * 2, body);
}

const files: Record<string, string> = {
  'koina-mark.svg': svg(SIZE, SIZE, cells(light)),
  'koina-mark-solid.svg': svg(SIZE, SIZE, cells(lightSolid)),
  'koina-mark-inverse.svg': svg(SIZE + 48, SIZE + 48, `<rect width="${SIZE + 48}" height="${SIZE + 48}" rx="30" fill="${palette.pine}"/>${cells(inverse, 24, 24)}`),
  'koina-mark-mono.svg': svg(SIZE, SIZE, cells(mono)),
  'koina-wordmark.svg': wordmark(light, palette.pine),
  'koina-wordmark-solid.svg': wordmark(lightSolid, palette.pine),
  'koina-wordmark-inverse.svg': wordmark(inverse, palette.marbleOnDark, palette.pine),
  'koina-wordmark-mono.svg': wordmark(mono, 'currentColor'),
  // Favicon: koyu zemin, küçük boyutta boş hücreler okunmadığı için yok.
  'favicon.svg': svg(SIZE + 32, SIZE + 32, `<rect width="${SIZE + 32}" height="${SIZE + 32}" rx="28" fill="${palette.pine}"/>${cells({ ...inverse, empty: null }, 16, 16)}`),
};

for (const [name, content] of Object.entries(files)) writeFileSync(resolve(outDir, name), content);

// Site, wordmark'ı tema ile renk değiştirebilsin diye mono değil iki renkli "solid" sürümü kullanır.
const sitePublic = resolve(root, 'site/public');
copyFileSync(resolve(outDir, 'favicon.svg'), resolve(sitePublic, 'favicon.svg'));
copyFileSync(resolve(outDir, 'koina-mark-solid.svg'), resolve(sitePublic, 'logo.svg'));

console.log(`Logo: ${Object.keys(files).length} dosya → ${outDir}`);
