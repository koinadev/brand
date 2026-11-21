# Koina marka kiti

Kararların gerekçesi: `plan/01-marka.md` (koinadev/koina-plan, gizli).

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
| `social/out/profile/avatar-*.png` | Sosyal profil fotoğrafları (800×800, daire güvenli) |

## Yazı tipleri

| Font | Ağırlık | Kullanım |
| --- | --- | --- |
| DM Sans | 700 | Başlıklar, logo yazısı (harf aralığı -0.03em) |
| DM Sans | 400 / 500 | Gövde metni, etiketler |
| Caveat | 600 | El yazısı notlar (mavi, kısa) |

İkisi de SIL OFL 1.1. Font dosyaları repoda tutulmaz; npm'deki `@fontsource/dm-sans` ve
`@fontsource/caveat` paketlerinden gelir (`social/package.json`). Latin-ext alt kümesi Türkçe
karakterleri (ş, ğ, ı, İ) kapsar. Eski Bricolage Grotesque ve Instrument Sans kullanılmıyor.

## Logoyu yeniden üretmek

Logo elle çizilmez; `social/scripts/build-logo.ts` işaret tanımından ve DM Sans Bold'dan üretir,
yazıyı path'e çevirir (SVG hiçbir yerde font beklemez) ve sitenin `public/` klasörüne de kopyalar.
Geometri sitenin `src/lib/mark.ts` dosyasıyla aynı; ikisini birlikte güncelle.

```bash
cd social && bun install && bun run logo
```

## Palet

Tek kaynak sitenin `packages/shared/src/brand.ts` dosyası; `social/scripts/palette.ts` ve
`tokens.css`/`tokens.json` aynı değerleri taşır.

| Ad | Hex | Kullanım |
| --- | --- | --- |
| Lacivert | `#1B1F3B` | Metin, logo gövdesi, koyu şerit |
| Kâğıt | `#FBFAF7` | Zemin |
| Ayçiçeği | `#FFD23F` | Butonlar, CTA blokları |
| Mavi | `#3341C4` | Linkler, el yazısı notlar |
| Pembe | `#FF7AA2` | El çizimi halka, logo noktası |
| Nane | `#9FE3C0` | El çizimi kıvrımlar |
| Lila | `#ECEEFF` | İkon zeminleri |
| İkincil metin | `#50567A` | Açıklamalar, tarih ve etiket metni |
| Canlı | `#E5484D` | "Canlı" rozeti |
| Çizgi | `#E7E5EE` | Ayırıcılar, kenarlıklar |
| Koyu mürekkep | `#11142A` | Kod blokları |

Koyu tema: zemin lacivert `#1B1F3B`, metin kâğıt `#FBFAF7`, logo `*-inverse.svg`.
