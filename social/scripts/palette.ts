// Sosyal şablonların marka değerleri. Tek doğruluk kaynağı sitenin
// `packages/shared/src/brand.ts` dosyası; bir rengi orada değiştirince burayı da güncelle.
// Site ayrı bir repo olduğu için değerler buraya kopyalanır, oradan içe aktarılmaz.
//
// Görsel dil: açık kâğıt zemin, lacivert mürekkep, sarı hap etiketler. Pembe ve nane yalnızca
// küçük el çizimi vurgularda. Koyu temada zemin lacivert, metin kâğıt rengi.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const modules = resolve(here, '../node_modules');

export const palette = {
  bg: '#FBFAF7', // kâğıt zemin
  surface: '#FFFFFF',
  fg: '#1B1F3B', // lacivert mürekkep; koyu temada zemin
  muted: '#50567A',
  primary: '#FFD23F', // sarı hap butonlar ve etiketler
  onPrimary: '#1B1F3B',
  link: '#3341C4',
  accent: '#FF7AA2', // pembe: yalnız küçük vurgular
  live: '#E5484D', // "Canlı" rozeti
  onLive: '#FFFFFF',
  tint: '#ECEEFF',
  line: '#E7E5EE',
  mint: '#9FE3C0', // el çizimi kıvrımlar
  ink: '#11142A', // kod blokları gibi en koyu yüzeyler
  // Koyu zeminde mavi kaybolur; logodaki gibi açık lavantaya döner (build-logo.ts ile aynı).
  linkOnDark: '#8C97F0',
} as const;

export const fonts = {
  // @fontsource paketleri latin + latin-ext alt kümelerini taşır; ş, ğ, ı, İ latin-ext'te.
  css: [
    '@fontsource/dm-sans/400.css',
    '@fontsource/dm-sans/500.css',
    '@fontsource/dm-sans/700.css',
    '@fontsource/caveat/600.css',
  ].map((f) => resolve(modules, f)),
  sans: "'DM Sans', system-ui, sans-serif",
  hand: "'Caveat', 'Comic Sans MS', cursive",
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
  displayWeight: 700,
  tracking: '-0.03em',
} as const;

// ---------------------------------------------------------------- logo

type LogoName = 'mark' | 'wordmark';

/**
 * Hazır logo dosyası (`logo/`). Koyu zeminde inverse varyant kullanılır; inverse
 * dosyalardaki lacivert arka plan kutusu çıkarılır ve viewBox işaretin kendisine daraltılır,
 * böylece iki varyant da aynı oranda ölçeklenir.
 */
export function logoSvg(name: LogoName, dark = false) {
  const file = `koina-${name}${dark ? '-inverse' : ''}.svg`;
  let svg = readFileSync(resolve(root, 'logo', file), 'utf8')
    .trim()
    .replace(/<title>.*?<\/title>/, '')
    .replace(/ width="\d+" height="\d+"/, '');
  if (dark) {
    // <rect width=".." height=".." rx=".." fill="#1B1F3B"/> kutusu ve translate(ox oy) kayması
    const box = svg.match(/<g transform="translate\((\d+) (\d+)\)/);
    const [ox, oy] = box ? [box[1], box[2]] : ['0', '0'];
    // İç boyut = kutu − iki kenar payı; wordmark genişliği yazıyla değiştiği için ölçülür.
    const [w, h] = (svg.match(/viewBox="0 0 (\d+) (\d+)"/) ?? ['', '96', '96']).slice(1).map(Number);
    const inner = `${w - Number(ox) * 2} ${h - Number(oy) * 2}`;
    svg = svg
      .replace(/<rect width="\d+" height="\d+" rx="\d+" fill="[^"]+"\/>/, '')
      .replace(/viewBox="[^"]+"/, `viewBox="${ox} ${oy} ${inner}"`);
  }
  return svg;
}
