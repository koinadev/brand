// Kanal boyutları. plan/04-icerik-stratejisi.md tablosuyla aynı tutulmalı.
// `safe`: platformun kırptığı alanlar için içerik kutusu (px, kenarlardan içeri).
export type Size = { w: number; h: number; label: string; safe?: { x: number; y: number } };

export const sizes = {
  'ig-square': { w: 1080, h: 1080, label: 'Instagram kare gönderi' },
  'ig-portrait': { w: 1080, h: 1350, label: 'Instagram dikey gönderi / carousel' },
  story: { w: 1080, h: 1920, label: 'Story / Reel / Shorts / TikTok kapağı', safe: { x: 0, y: 250 } },
  'linkedin-square': { w: 1200, h: 1200, label: 'LinkedIn kare gönderi' },
  'linkedin-link': { w: 1200, h: 627, label: 'LinkedIn bağlantı görseli' },
  'linkedin-company-cover': { w: 1128, h: 191, label: 'LinkedIn şirket sayfası kapağı' },
  'linkedin-banner': { w: 1584, h: 396, label: 'LinkedIn kişisel profil kapağı', safe: { x: 0, y: 0 } },
  'x-post': { w: 1600, h: 900, label: 'X gönderi görseli' },
  'x-header': { w: 1500, h: 500, label: 'X profil kapağı', safe: { x: 0, y: 60 } },
  'yt-thumbnail': { w: 1280, h: 720, label: 'YouTube kapak görseli' },
  // YouTube kanal kapağı: her cihazda görünen güvenli alan 1546×423, ortada.
  'yt-banner': { w: 2560, h: 1440, label: 'YouTube kanal kapağı', safe: { x: 507, y: 508 } },
  'discord-splash': { w: 1920, h: 1080, label: 'Discord sunucu davet arka planı' },
  'discord-event': { w: 800, h: 320, label: 'Discord etkinlik kapağı' },
  stream: { w: 1920, h: 1080, label: 'Yayın ekranı (OBS sahnesi)' },
  og: { w: 1200, h: 630, label: 'Web OG görseli' },
  avatar: { w: 800, h: 800, label: 'Profil fotoğrafı (daire güvenli)' },
} satisfies Record<string, Size>;

export type SizeName = keyof typeof sizes;
