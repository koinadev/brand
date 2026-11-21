// Koina logo üreticisi. Tek kaynak: aşağıdaki işaret tanımı + DM Sans Bold.
// Çıktı: ../logo/*.svg ve sitenin apps/web/public/ klasörüne favicon + logo.
// Yazı SVG içinde <text> olarak değil PATH olarak gömülür; logo hiçbir yerde font beklemez.
import opentype from 'opentype.js';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = resolve(root, 'logo');
mkdirSync(outDir, { recursive: true });

// İşaret: uzun bir hap (K'nın gövdesi) ve üç nokta (bir araya gelen insanlar, imece).
// Geometri sitenin src/lib/mark.ts dosyasıyla aynı; ikisini birlikte güncelle.
const SIZE = 96;
const C = { navy: '#1B1F3B', paper: '#FBFAF7', pink: '#FF7AA2', blue: '#3341C4', yellow: '#FFD23F', lilac: '#8C97F0' };
type Colors = { stem: string; joint: string; top: string; bottom: string };

function cells(c: Colors, ox = 0, oy = 0, scale = 1) {
  const dot = (cx: number, cy: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="15" fill="${fill}"/>`;
  return (
    `<g transform="translate(${ox} ${oy}) scale(${scale})">` +
    `<rect x="0" y="0" width="30" height="96" rx="15" fill="${c.stem}"/>` +
    dot(55, 48, c.joint) +
    dot(81, 15, c.top) +
    dot(81, 81, c.bottom) +
    '</g>'
  );
}

const svg = (w: number, h: number, body: string, title = 'Koina') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const light: Colors = { stem: C.navy, joint: C.blue, top: C.pink, bottom: C.yellow };
// Koyu zeminde mavi kaybolur; eklem noktası açık lavantaya döner.
const inverse: Colors = { stem: C.paper, joint: C.lilac, top: C.pink, bottom: C.yellow };
const mono: Colors = { stem: 'currentColor', joint: 'currentColor', top: 'currentColor', bottom: 'currentColor' };

// Wordmark: "koina.dev", k'nin yüksekliği ızgara yüksekliğine eşit, taban çizgisi ızgaranın altı.
const fontFile = readFileSync(resolve(root, 'social/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff'));
const font = opentype.parse(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));
function wordPath(text: string, x: number, fill: string) {
  const probe = font.getPath('k', 0, 0, 100);
  const kb = probe.getBoundingBox();
  const fontSize = (SIZE / (0 - kb.y1)) * 100; // k'nin üstü ızgaranın üstüne otursun
  const tracking = -0.03 * fontSize;
  let cursor = x;
  let bottom = SIZE;
  const parts: string[] = [];
  // stringToGlyphs bu fontun GSUB tablosunu desteklemiyor; "koina" için ligatür gerekmediğinden
  // karakter karakter eşlemek yeterli.
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  glyphs.forEach((g, i) => {
    // `getPath` bu WOFF'ta bazı noktaları NaN üretiyor; komutları elle ölçekliyoruz.
    const k = fontSize / font.unitsPerEm;
    const X = (v: number) => (cursor + v * k).toFixed(2);
    const Y = (v: number) => (SIZE - v * k).toFixed(2);
    // Yuvarlak harfler (o, a, e) ve nokta taban çizgisinin biraz altına taşar; çerçeve buna göre uzar.
    for (const c of g.path.commands) if ('y' in c) bottom = Math.max(bottom, SIZE - c.y * k);
    parts.push(
      g.path.commands
        .map((c) =>
          c.type === 'M' || c.type === 'L'
            ? `${c.type}${X(c.x)} ${Y(c.y)}`
            : c.type === 'Q'
              ? `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`
              : c.type === 'C'
                ? `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`
                : 'Z',
        )
        .join(''),
    );
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    cursor += ((g.advanceWidth ?? 0) + kern) * (fontSize / font.unitsPerEm) + tracking;
  });
  return { d: parts.join(''), width: cursor - x, bottom, fill };
}

// Logotip `koina.dev`: alan adı adın parçası. `.dev` aynı yazıyla, ikinci renkte (sitedeki
// Wordmark.astro ile aynı).
function wordmark(c: Colors, textFill: string, tldFill: string, bg?: string) {
  const textX = SIZE + 22;
  const w = wordPath('koina', textX, textFill);
  const tld = wordPath('.dev', textX + w.width, tldFill);
  const width = Math.ceil(textX + w.width + tld.width + 4);
  const height = Math.ceil(Math.max(w.bottom, tld.bottom) + 1);
  const pad = bg ? 32 : 0;
  const body =
    (bg ? `<rect width="${width + pad * 2}" height="${height + pad * 2}" rx="24" fill="${bg}"/>` : '') +
    `<g transform="translate(${pad} ${pad})">${cells(c)}<path d="${w.d}" fill="${w.fill}"/><path d="${tld.d}" fill="${tld.fill}"/></g>`;
  return svg(width + pad * 2, height + pad * 2, body, 'koina.dev');
}

const files: Record<string, string> = {
  'koina-mark.svg': svg(SIZE, SIZE, cells(light)),
  'koina-mark-inverse.svg': svg(SIZE + 48, SIZE + 48, `<rect width="${SIZE + 48}" height="${SIZE + 48}" rx="30" fill="${C.navy}"/>${cells(inverse, 24, 24)}`),
  'koina-mark-mono.svg': svg(SIZE, SIZE, cells(mono)),
  'koina-wordmark.svg': wordmark(light, C.navy, C.blue),
  'koina-wordmark-inverse.svg': wordmark(inverse, C.paper, C.lilac, C.navy),
  'koina-wordmark-mono.svg': wordmark(mono, 'currentColor', 'currentColor'),
  // Favicon: sarı zemin (sitenin buton rengi); alt nokta zeminle aynı renk olmasın diye lacivert.
  'favicon.svg': svg(128, 128, `<rect width="128" height="128" rx="30" fill="${C.yellow}"/>${cells({ ...light, bottom: C.navy }, 18, 18, 0.9583)}`),
};

for (const [name, content] of Object.entries(files)) writeFileSync(resolve(outDir, name), content);

const sitePublic = resolve(root, '../site/apps/web/public');
copyFileSync(resolve(outDir, 'favicon.svg'), resolve(sitePublic, 'favicon.svg'));
copyFileSync(resolve(outDir, 'koina-mark.svg'), resolve(sitePublic, 'logo.svg'));

console.log(`Logo: ${Object.keys(files).length} dosya → ${outDir}`);
