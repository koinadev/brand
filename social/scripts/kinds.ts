// Şablon türleri. Her tür `(data, size, theme) => html` döndürür; veri alanları README'de.
import { page, esc, hash, shapeOf, contributionStrip, registerCss, squiggle, type Theme } from './templates.ts';
import { palette as P, logoSvg } from './palette.ts';
import type { Size } from './sizes.ts';

type Ctx = { size: Size; theme: Theme };
type Kind<D> = (d: D, c: Ctx) => string;

registerCss(`
/* Alıntı işareti: logodaki gibi noktalar (pembe, mavi, sarı). */
.quote-mark { display: grid; grid-template-columns: repeat(2, calc(var(--u) * 3.4)); gap: calc(var(--u) * 0.8); }
.quote-mark i { aspect-ratio: 1; border-radius: 50%; background: var(--accent); }
.quote-mark i:nth-child(2) { background: var(--link); }
.quote-mark i:nth-child(3) { background: transparent; }
.quote-mark i:nth-child(4) { background: var(--primary); }
blockquote { font-family: var(--f-sans); font-weight: var(--f-weight); letter-spacing: -0.025em; line-height: 1.1; font-size: calc(var(--u) * 7.2); text-wrap: balance; }
.who { display: flex; align-items: center; gap: calc(var(--u) * 2.4); font: 700 calc(var(--u) * 3.6)/1.2 var(--f-sans); }
.who small { display: block; font-weight: 400; font-size: 0.8em; color: var(--muted); margin-top: calc(var(--u) * 0.6); }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(var(--u) * 3); border-top: calc(var(--u) * 0.25) solid var(--line); padding-top: calc(var(--u) * 3.4); }
.stats b { display: block; font: var(--f-weight) calc(var(--u) * 10)/0.95 var(--f-sans); letter-spacing: var(--f-track); }
.stats span { display: block; margin-top: calc(var(--u) * 1.2); font-size: calc(var(--u) * 2.9); line-height: 1.3; color: var(--muted); }
.strip-wrap .strip-grid { display: block; }

/* Kod bloğu her iki temada da en koyu mürekkep yüzeyinde. */
.code { background: var(--ink); color: ${P.bg}; border-radius: calc(var(--u) * 2.4); padding: calc(var(--u) * 3.4) calc(var(--u) * 3.8);
  font: 500 calc(var(--u) * 3.1)/1.55 var(--f-mono); white-space: pre; overflow: hidden; }
.code .c { color: rgba(251,250,247,0.5); } .code .k { color: var(--primary); } .code .s { color: ${P.linkOnDark}; }

.counter { font: 700 calc(var(--u) * 3.2)/1 var(--f-sans); color: var(--muted); }
.counter b { color: var(--fg); }
.card-body { font-size: calc(var(--u) * 4.1); line-height: 1.45; max-width: 30ch; text-wrap: pretty; }

.banner { position: absolute; inset: 0; display: flex; align-items: center; }
.banner .wm svg { height: 100%; width: auto; display: block; }
.banner .tag { font: 500 var(--tag-size)/1.15 var(--f-sans); letter-spacing: -0.02em; color: var(--fg); text-wrap: balance; overflow-wrap: break-word; }

.lower { position: absolute; left: calc(var(--u) * 6); bottom: calc(var(--u) * 7); display: flex; align-items: stretch; border-radius: calc(var(--u) * 1.6); overflow: hidden; }
.lower .tab { width: calc(var(--u) * 1.6); background: var(--primary); }
.lower .txt { background: ${P.fg}; color: ${P.bg}; padding: calc(var(--u) * 2) calc(var(--u) * 3.2); }
.lower .txt b { display: block; font: 700 calc(var(--u) * 4.2)/1.05 var(--f-sans); letter-spacing: -0.02em; }
.lower .txt span { display: block; margin-top: calc(var(--u) * 0.8); font: 500 calc(var(--u) * 2.4)/1.2 var(--f-sans); color: rgba(251,250,247,0.75); }
`);

// ------------------------------------------------------------------ duyuru

export type AnnounceData = { badge?: string; title: string; body?: string; meta?: { label: string; value: string }[] };
export const announce: Kind<AnnounceData> = (d, { size, theme }) => {
  const shape = shapeOf(size);
  const flat = shape === 'strip';
  return page({
    size,
    theme,
    seed: hash(d.title),
    footer: !flat,
    body: `<div class="content">
      ${d.badge ? `<span class="pill">${esc(d.badge)}</span>` : ''}
      <div class="grow fit"><h1 data-fit>${esc(d.title)}</h1>${flat ? '' : squiggle()}
      ${d.body && !flat ? `<p class="lede">${esc(d.body)}</p>` : ''}</div>
      ${d.meta?.length ? `<div class="meta">${d.meta.map((m) => `<span><small>${esc(m.label)}</small>${esc(m.value)}</span>`).join('')}</div>` : ''}
    </div>`,
  });
};

// ------------------------------------------------------------------ canlı yayın

export type LiveData = { format: string; title: string; guest?: string; role?: string; date: string; time: string; platform?: string };
export const live: Kind<LiveData> = (d, { size, theme }) =>
  page({
    size,
    theme,
    seed: hash(d.title + d.date),
    // Geniş formatlarda motif sağ üstte kalır; başlığın arkası sakin olsun.
    motif: ['wide', 'strip'].includes(shapeOf(size)) ? { focus: [1, 0.05], spread: 1.1 } : { focus: [1, 0.05] },
    body: `<div class="content">
      <div style="display:flex;gap:calc(var(--u)*1.4);flex-wrap:wrap">
        <span class="pill live"><i class="dot"></i>Canlı</span>
        <span class="pill outline">${esc(d.format)}</span>
      </div>
      <div class="grow fit"><h1 data-fit>${esc(d.title)}</h1></div>
      <div class="meta">
        ${d.guest ? `<span><small>${esc(d.role ?? 'Konuk')}</small>${esc(d.guest)}</span>` : ''}
        <span><small>Tarih</small>${esc(d.date)}</span>
        <span><small>Saat</small>${esc(d.time)}</span>
        ${d.platform ? `<span><small>Nerede</small>${esc(d.platform)}</span>` : ''}
      </div>
    </div>`,
  });

// ------------------------------------------------------------------ alıntı

export type QuoteData = { quote: string; name: string; role: 'Usta' | 'Katılımcı' | 'Bakımcı' | string; project?: string };
export const quote: Kind<QuoteData> = (d, { size, theme }) =>
  page({
    size,
    theme,
    seed: hash(d.quote),
    motif: { focus: [1, 1], spread: 0.6 },
    body: `<div class="content">
      <div class="quote-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="grow fit" style="justify-content:flex-start"><blockquote data-fit>${esc(d.quote)}</blockquote></div>
      <div class="who"><span class="pill ${d.role === 'Usta' ? 'mentor' : ''}">${esc(d.role)}</span>
        <div>${esc(d.name)}${d.project ? `<small>${esc(d.project)}</small>` : ''}</div></div>
    </div>`,
  });

// ------------------------------------------------------------------ rakamlar

export type StatsData = { title: string; period: string; items: { value: string; label: string }[]; days?: number[] };
export const stats: Kind<StatsData> = (d, { size, theme }) => {
  const u = Math.min(size.w, size.h) / 100;
  return page({
    size,
    theme,
    seed: hash(d.title + d.period),
    motif: false,
    body: `<div class="content">
      <span class="pill outline">${esc(d.period)}</span>
      <div class="grow fit"><h1 data-fit>${esc(d.title)}</h1></div>
      ${d.days ? `<div class="strip-wrap">${contributionStrip(d.days, Math.round(u * 2.6), theme)}</div>` : ''}
      <div class="stats">${d.items
        .slice(0, 3)
        .map((i) => `<div><b>${esc(i.value)}</b><span>${esc(i.label)}</span></div>`)
        .join('')}</div>
    </div>`,
  });
};

// ------------------------------------------------------------------ kod

export type CodeData = { title: string; code: string; caption?: string };
/** Çok basit vurgulama: `//` yorum, tırnaklı dize, birkaç anahtar kelime. Görsel için yeterli. */
function highlight(src: string) {
  return esc(src)
    .replace(/(\/\/.*)$/gm, '<span class="c">$1</span>')
    .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="s">$1</span>')
    .replace(/\b(const|let|function|return|if|else|await|async|export|import|from|throw|new)\b/g, '<span class="k">$1</span>');
}
export const code: Kind<CodeData> = (d, { size, theme }) =>
  page({
    size,
    theme,
    seed: hash(d.code),
    // Başlık tam genişlikte; motif boş kalan sağ alt köşeye.
    motif: { focus: [1, 1], spread: 0.5 },
    body: `<div class="content">
      <div class="fit" style="flex:0 1 auto"><h1 data-fit style="font-size:calc(var(--u)*7.2)">${esc(d.title)}</h1></div>
      <div class="code">${highlight(d.code)}</div>
      ${d.caption ? `<p class="lede">${esc(d.caption)}</p>` : ''}
    </div>`,
  });

// ------------------------------------------------------------------ carousel

export type CarouselData = {
  title: string;
  subtitle?: string;
  cards: { heading: string; body: string }[];
  cta: { title: string; body: string };
};
/** Carousel tek görsel değil bir dizi: [kapak, ...kartlar, kapanış]. */
export function carousel(d: CarouselData, c: Ctx): string[] {
  const total = d.cards.length + 2;
  const counter = (n: number) => `<span class="counter"><b>${n}</b> / ${total}</span>`;
  const cover = page({
    ...c,
    seed: hash(d.title),
    body: `<div class="content">${counter(1)}
      <div class="grow fit"><h1 data-fit>${esc(d.title)}</h1>${squiggle()}${d.subtitle ? `<p class="lede">${esc(d.subtitle)}</p>` : ''}</div>
      <span class="hand">kaydır →</span></div>`,
  });
  const cards = d.cards.map((card, i) =>
    page({
      ...c,
      seed: hash(card.heading),
      motif: { focus: [1, 1], spread: 0.45 },
      body: `<div class="content">${counter(i + 2)}
        <div class="fit" style="flex:0 1 auto"><h1 data-fit style="font-size:calc(var(--u)*8.4)">${esc(card.heading)}</h1></div>
        <p class="card-body">${esc(card.body)}</p></div>`,
    }),
  );
  const end = page({
    ...c,
    theme: 'dark',
    seed: hash(d.cta.title),
    body: `<div class="content">${counter(total)}
      <div class="grow fit"><h1 data-fit>${esc(d.cta.title)}</h1><p class="lede">${esc(d.cta.body)}</p></div></div>`,
  });
  return [cover, ...cards, end];
}

// ------------------------------------------------------------------ profil kapakları (banner)

// Slogan ana öğe; `koina.dev` logotipi küçük, sağ altta imza gibi durur (profil adı zaten logoyu gösteriyor).
// `align: 'end'`: profil fotoğrafının sol alt köşeye bindiği kapaklarda (X, LinkedIn) slogan sağa, motif sola geçer.
export type BannerData = { tagline: string; align?: 'end' };
export const banner: Kind<BannerData> = (d, { size, theme }) => {
  const safe = size.safe ?? { x: 0, y: 0 };
  const innerW = size.w - safe.x * 2;
  const innerH = size.h - safe.y * 2;
  const shape = shapeOf(size);
  const flat = ['strip', 'wide'].includes(shape);
  const pad = Math.round(Math.min(innerH * 0.14, innerW * 0.04));
  const tagSize = Math.round(innerH * (flat ? 0.15 : safe.y ? 0.2 : 0.09));
  const wmH = Math.max(18, Math.round(innerH * (flat ? 0.08 : safe.y ? 0.1 : 0.045)));
  // Hazır wordmark dosyası; koyu zeminde inverse varyant.
  const wm = logoSvg('wordmark', theme === 'dark');
  return page({
    size,
    theme,
    seed: hash(d.tagline),
    footer: false,
    // Motif yazının karşı tarafında kalır ki slogan temiz zemine düşsün; 16:9 kapaklarda yalnız sağ üst köşede.
    motif: d.align === 'end' ? { focus: [0, 0.5], spread: shape === 'strip' ? 1.25 : 0.75 } : flat ? { focus: [1, 0.5], spread: 1.25 } : { focus: [1, 0], spread: 0.62 },
    body: `<div class="banner" style="inset:${safe.y}px ${safe.x}px;padding:${pad}px ${pad}px ${pad + wmH}px;${d.align === 'end' ? 'justify-content:flex-end;' : ''}--tag-size:${tagSize}px">
      <div class="tag" style="max-width:${Math.round(innerW * (d.align === 'end' ? 0.55 : 0.6))}px">${esc(d.tagline)}</div>
      <div class="wm" style="position:absolute;right:${pad}px;bottom:${Math.round(pad * 0.7)}px;height:${wmH}px">${wm}</div></div>`,
  });
};

// ------------------------------------------------------------------ avatar

export const avatar: Kind<Record<string, never>> = (_d, { size, theme }) => {
  const mark = logoSvg('mark', theme === 'dark');
  return page({
    size,
    theme,
    seed: 1,
    footer: false,
    motif: false,
    // Daire kırpmada köşeler gider; işaret dairenin içindeki karenin %62'sini kaplar.
    body: `<div style="position:absolute;inset:0;display:grid;place-items:center"><div style="width:44%">${mark.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></div>`,
  });
};

// ------------------------------------------------------------------ yayın ekranları

export type StreamData = { state: 'starting' | 'break' | 'ending' | 'offline'; title: string; subtitle?: string };
const streamCopy = { starting: 'Birazdan başlıyoruz', break: 'Kısa bir mola', ending: 'İzlediğin için teşekkürler', offline: 'Şu an yayında değiliz' };
export const stream: Kind<StreamData> = (d, { size, theme }) =>
  page({
    size,
    theme,
    seed: hash(d.state + d.title),
    motif: { focus: [1, 0.5], spread: 0.9 },
    body: `<div class="content" style="justify-content:center;right:45%">
      <span class="pill ${d.state === 'starting' ? '' : 'outline'}">${streamCopy[d.state]}</span>
      <div class="fit" style="flex:0 1 auto"><h1 data-fit>${esc(d.title)}</h1></div>
      ${d.subtitle ? `<p class="lede">${esc(d.subtitle)}</p>` : ''}</div>`,
  });

export type LowerThirdData = { name: string; role: string };
export const lowerThird: Kind<LowerThirdData> = (d, { size }) =>
  page({
    size,
    theme: 'dark',
    seed: 1,
    transparent: true,
    footer: false,
    motif: false,
    body: `<div class="lower"><div class="tab"></div><div class="txt"><b>${esc(d.name)}</b><span>${esc(d.role)}</span></div></div>`,
  });

export const kinds = { announce, live, quote, stats, code, banner, avatar, stream, lowerThird } as const;
export type KindName = keyof typeof kinds | 'carousel';
