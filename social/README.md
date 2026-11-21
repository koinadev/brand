# Koina sosyal görsel üreticisi

HTML şablonları Playwright (Chromium) ile PNG'ye çevirir. Tüm boyutlar, tüm türler tek komut.

```bash
bun install
bun run render                      # specs.ts içindeki her şey → out/<grup>/<ad>.png
bun run render -- --only live       # yalnız bir grup ya da ad
bun run logo                        # logoları yeniden üret (../logo)
```

Tek seferlik görsel (specs.ts'e eklemeden):

```bash
bun run render -- --kind live --size story --theme dark --data veri.json --out out/tmp/yayin.png
```

## Boyutlar (`scripts/sizes.ts`)

`ig-square` 1080², `ig-portrait` 1080×1350, `story` 1080×1920, `linkedin-square` 1200²,
`linkedin-link` 1200×627, `linkedin-company-cover` 1128×191, `linkedin-banner` 1584×396,
`x-post` 1600×900, `x-header` 1500×500, `yt-thumbnail` 1280×720, `yt-banner` 2560×1440,
`discord-splash` 1920×1080, `discord-event` 800×320, `stream` 1920×1080, `og` 1200×630,
`avatar` 800².

## Türler ve veri alanları (`scripts/kinds.ts`)

| Tür | Alanlar | Kullanım |
| --- | --- | --- |
| `announce` | `title`, `badge?`, `body?`, `meta?: [{label, value}]` | Duyuru, başvuru, lansman |
| `live` | `format`, `title`, `date`, `time`, `guest?`, `role?`, `platform?` | Canlı yayın duyurusu, YouTube kapağı |
| `quote` | `quote`, `name`, `role` (`Usta`/`Katılımcı`/`Bakımcı`), `project?` | Usta Notu, İlk PR |
| `stats` | `title`, `period`, `items: [{value, label}]` (3), `days?: number[]` | Koina Haftası (gün başına PR sayısı → katkı ızgarası) |
| `code` | `title`, `code`, `caption?` | Haftanın Commit'i |
| `carousel` | `title`, `subtitle?`, `cards: [{heading, body}]`, `cta: {title, body}` | Çok sayfalı IG/LinkedIn; kapak + kartlar + kapanış |
| `banner` | `tagline` | Profil kapakları |
| `avatar` | — | Profil fotoğrafı (`theme` ile açık/koyu) |
| `stream` | `state` (`starting`/`break`/`ending`/`offline`), `title`, `subtitle?` | OBS sahneleri |
| `lowerThird` | `name`, `role` | OBS alt bant, şeffaf PNG |

Başlıklar kutuya sığana kadar otomatik küçülür; çok uzun başlıkta bile taşma olmaz ama
okunurluk düşer — başlıkları 8 kelimenin altında tut.

## Haftalık iş akışı

1. `scripts/specs.ts` içindeki ilgili girdinin metnini güncelle (ör. `koina-haftasi`).
2. `bun run render -- --only koina-haftasi`
3. `out/series/koina-haftasi.png` dosyasını planlayıcıya yükle.
