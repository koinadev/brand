# Koina marka kiti

Kararların gerekçesi: [`../plan/01-marka.md`](../plan/01-marka.md).

## İşaret

K harfi bir hap ve üç noktadan oluşur. Lacivert hap K'nın gövdesi; pembe, mavi ve sarı noktalar
bir araya gelen insanlar, yani imece. Formu sitenin hap butonları ve yuvarlak rozetleriyle aynı.

## Dosyalar

| Dosya | Ne zaman |
| --- | --- |
| `logo/koina-wordmark.svg` | Varsayılan logo, açık zemin |
| `logo/koina-wordmark-inverse.svg` | Koyu zemin, hazır arka plan kutusuyla |
| `logo/koina-wordmark-mono.svg` | Tek renk baskı; `currentColor` kullanır |
| `logo/koina-mark*.svg` | Yalnız işaret |
| `logo/favicon.svg` | Favicon, uygulama ikonu (sarı zemin) |
| `../social/out/profile/avatar-*.png` | Sosyal profil fotoğrafları (800×800, daire güvenli) |

Yazı tipi DM Sans (başlık ve metin) ve Caveat (el yazısı notlar); ikisi de SIL OFL 1.1.

## Logoyu yeniden üretmek

Logo elle çizilmez; `social/scripts/build-logo.ts` işaret tanımından ve DM Sans Bold'dan üretir,
yazıyı path'e çevirir (SVG hiçbir yerde font beklemez) ve sitenin `public/` klasörüne de kopyalar.
Geometri sitenin `src/lib/mark.ts` dosyasıyla aynı; ikisini birlikte güncelle.

```bash
cd social && bun install && bun run logo
```

## Palet

Tek kaynak sitenin `src/styles/palettes.css` dosyası.

| Ad | Hex | Kullanım |
| --- | --- | --- |
| Lacivert | `#1B1F3B` | Metin, logo gövdesi, koyu şerit |
| Kâğıt | `#FBFAF7` | Zemin |
| Ayçiçeği | `#FFD23F` | Butonlar, CTA blokları |
| Mavi | `#3341C4` | Linkler, el yazısı notlar |
| Pembe | `#FF7AA2` | El çizimi halka, logo noktası |
| Nane | `#9FE3C0` | El çizimi kıvrımlar |
| Lila | `#ECEEFF` | İkon zeminleri |
