# Koina marka kiti

Kararların gerekçesi: [`../plan/01-marka.md`](../plan/01-marka.md).

## Dosyalar

| Dosya | Ne zaman |
| --- | --- |
| `logo/koina-wordmark.svg` | Varsayılan logo, açık zemin (boş hücreler görünür — "katkı ızgarası") |
| `logo/koina-wordmark-solid.svg` | Küçük kullanımlar, site header'ı (boş hücre yok) |
| `logo/koina-wordmark-inverse.svg` | Koyu zemin, hazır arka plan kutusuyla |
| `logo/koina-wordmark-mono.svg` | Tek renk baskı; `currentColor` kullanır |
| `logo/koina-mark*.svg` | Yalnız işaret (ızgara K) |
| `logo/favicon.svg` | Favicon, uygulama ikonu |
| `../social/out/profile/avatar-*.png` | Sosyal profil fotoğrafları (800×800, daire güvenli) |
| `tokens.css`, `tokens.json` | Renk, font, yarıçap token'ları |
| `fonts/` | Bricolage Grotesque + Instrument Sans (SIL OFL 1.1, lisanslar yanında) |

## Logoyu yeniden üretmek

Logo elle çizilmez; `social/scripts/build-logo.ts` ızgara tanımından ve fonttan üretir, yazıyı
path'e çevirir (SVG hiçbir yerde font beklemez) ve sitenin `public/` klasörüne de kopyalar.

```bash
cd social && bun install && bun run logo
```

## Palet

| Ad | Hex | Kullanım |
| --- | --- | --- |
| Çam | `#173229` | Metin, koyu zemin |
| Yosun | `#2F7A55` | Birincil (Katılımcı) |
| Filiz | `#9ED9A8` | Açık vurgu, ızgara |
| Polen | `#F2B33D` | İkincil (Usta), "canlı" |
| Mermer | `#F2F5F1` | Açık zemin |
| Sis | `#D5DFD8` | Kenarlık, boş hücre |
