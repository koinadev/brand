// Kullanım:
//   bun run render                         → specs.ts içindeki tüm görseller → out/<grup>/<ad>.png
//   bun run render -- --only launch        → adı ya da grubu eşleşenler
//   bun run render -- --kind live --size story --theme dark --data veri.json --out live.png
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { sizes, type SizeName } from './sizes.ts';
import { kinds, carousel } from './kinds.ts';
import { specs, type Spec } from './specs.ts';
import type { Theme } from './templates.ts';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values: args } = parseArgs({
  options: {
    only: { type: 'string' },
    kind: { type: 'string' },
    size: { type: 'string' },
    theme: { type: 'string', default: 'light' },
    data: { type: 'string' },
    out: { type: 'string' },
  },
});

function htmlFor(s: Pick<Spec, 'kind' | 'size' | 'theme' | 'data'>): string[] {
  const size = sizes[s.size];
  if (!size) throw new Error(`Bilinmeyen boyut: ${s.size}. Mevcut: ${Object.keys(sizes).join(', ')}`);
  const ctx = { size, theme: s.theme ?? 'light' };
  if (s.kind === 'carousel') return carousel(s.data as never, ctx);
  const fn = kinds[s.kind as keyof typeof kinds];
  if (!fn) throw new Error(`Bilinmeyen tür: ${s.kind}. Mevcut: carousel, ${Object.keys(kinds).join(', ')}`);
  return [fn(s.data as never, ctx)];
}

type Job = { html: string; out: string; w: number; h: number; transparent: boolean };
const jobs: Job[] = [];

if (args.kind) {
  if (!args.size || !args.out) throw new Error('--kind ile birlikte --size ve --out zorunlu.');
  const data = args.data ? JSON.parse(readFileSync(args.data, 'utf8')) : {};
  const size = args.size as SizeName;
  htmlFor({ kind: args.kind, size, theme: args.theme as Theme, data }).forEach((html, i, all) =>
    jobs.push({ html, out: all.length > 1 ? args.out!.replace(/\.png$/, `-${i + 1}.png`) : args.out!, ...sizes[size], transparent: args.kind === 'lowerThird' }),
  );
} else {
  const list = args.only ? specs.filter((s) => s.group === args.only || s.name === args.only || `${s.group}/${s.name}` === args.only) : specs;
  if (!list.length) throw new Error(`--only "${args.only}" hiçbir spec ile eşleşmedi.`);
  for (const s of list) {
    const htmls = htmlFor(s);
    htmls.forEach((html, i) =>
      jobs.push({
        html,
        out: resolve(here, 'out', s.group, htmls.length > 1 ? `${s.name}-${String(i + 1).padStart(2, '0')}.png` : `${s.name}.png`),
        ...sizes[s.size],
        transparent: s.kind === 'lowerThird',
      }),
    );
  }
}

const tmp = resolve(here, '.cache');
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();
const pageObj = await browser.newPage();
for (const [i, j] of jobs.entries()) {
  // file:// üzerinden açıyoruz ki node_modules'taki font CSS'leri (file:// URL) yüklenebilsin.
  const file = resolve(tmp, `job-${i}.html`);
  writeFileSync(file, j.html);
  await pageObj.setViewportSize({ width: j.w, height: j.h });
  await pageObj.goto(pathToFileURL(file).href);
  await pageObj.evaluate(() => (window as unknown as { __fit: () => Promise<void> }).__fit());
  mkdirSync(dirname(j.out), { recursive: true });
  await pageObj.screenshot({ path: j.out, omitBackground: j.transparent });
  console.log(`✓ ${j.out.replace(here + '/', '')}  ${j.w}×${j.h}`);
}
await browser.close();
