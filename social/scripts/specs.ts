// Lansman kiti: hazır üretilecek tüm görseller. Yeni bir haftalık görsel için buraya bir giriş
// ekleyip `bun run render -- --only <ad>` deyin ya da doğrudan CLI bayraklarını kullanın (README).
import type { SizeName } from './sizes.ts';
import type { Theme } from './templates.ts';

export type Spec = { name: string; group: string; kind: string; size: SizeName; theme?: Theme; data: Record<string, unknown> };

const launch = {
  badge: 'Yeni topluluk',
  title: 'Aynı repoda buluşalım.',
  body: 'Koina; deneyimli geliştiricilerle yolun başındakileri açık kaynak projelerde buluşturan topluluk.',
};
const live = {
  format: 'Kodla Buluşma',
  title: 'Gerçek bir issue’yu canlı kapatıyoruz',
  date: '21 Kasım Cumartesi',
  time: '20:00',
};

export const specs: Spec[] = [
  // ---- profil kimliği
  { group: 'profile', name: 'avatar-dark', kind: 'avatar', size: 'avatar', theme: 'dark', data: {} },
  { group: 'profile', name: 'avatar-light', kind: 'avatar', size: 'avatar', theme: 'light', data: {} },
  { group: 'profile', name: 'x-header', kind: 'banner', size: 'x-header', data: { tagline: 'Usta ile çırak aynı commit geçmişinde.' } },
  { group: 'profile', name: 'linkedin-banner', kind: 'banner', size: 'linkedin-banner', data: { tagline: 'Açık kaynakta birlikte çalışarak kurulan network.' } },
  { group: 'profile', name: 'linkedin-company-cover', kind: 'banner', size: 'linkedin-company-cover', data: { tagline: 'Aynı repoda buluşalım.' } },
  { group: 'profile', name: 'yt-banner', kind: 'banner', size: 'yt-banner', theme: 'dark', data: { tagline: 'Her Cumartesi 20:00 canlı kodlama.' } },
  { group: 'profile', name: 'discord-splash', kind: 'banner', size: 'discord-splash', theme: 'dark', data: { tagline: 'Yayın sohbeti burada. Gel, tanış.' } },
  { group: 'profile', name: 'og-default', kind: 'announce', size: 'og', data: { title: 'Aynı repoda buluşalım.', body: launch.body } },

  // ---- lansman duyurusu, tüm gönderi boyutları
  { group: 'launch', name: 'ig-square', kind: 'announce', size: 'ig-square', data: launch },
  { group: 'launch', name: 'ig-portrait', kind: 'announce', size: 'ig-portrait', data: launch },
  { group: 'launch', name: 'story', kind: 'announce', size: 'story', theme: 'dark', data: { ...launch, meta: [{ label: 'İlk yayın', value: 'Cumartesi 20:00' }] } },
  { group: 'launch', name: 'linkedin-square', kind: 'announce', size: 'linkedin-square', data: launch },
  { group: 'launch', name: 'linkedin-link', kind: 'announce', size: 'linkedin-link', data: launch },
  { group: 'launch', name: 'x-post', kind: 'announce', size: 'x-post', theme: 'dark', data: launch },

  // ---- blog kapakları (site/apps/web/content/blog/<dil>/<yazı>/cover.png)
  { group: 'blog', name: 'koina-basliyor', kind: 'announce', size: 'og', data: launch },
  {
    group: 'blog',
    name: 'koina-is-starting',
    kind: 'announce',
    size: 'og',
    data: {
      badge: 'New community',
      title: 'Meet in the same repo.',
      body: 'Koina brings experienced developers and people early in their careers together on open source projects.',
    },
  },

  // ---- canlı yayın
  { group: 'live', name: 'ig-square', kind: 'live', size: 'ig-square', theme: 'dark', data: live },
  { group: 'live', name: 'story', kind: 'live', size: 'story', theme: 'dark', data: { ...live, platform: 'YouTube + Twitch' } },
  { group: 'live', name: 'x-post', kind: 'live', size: 'x-post', data: live },
  { group: 'live', name: 'yt-thumbnail', kind: 'live', size: 'yt-thumbnail', theme: 'dark', data: live },
  { group: 'live', name: 'discord-event', kind: 'live', size: 'discord-event', theme: 'dark', data: live },

  // ---- kesit kapağı: metni değiştirip yeniden üret
  { group: 'clip', name: 'kapak', kind: 'announce', size: 'story', theme: 'dark', data: { badge: 'Kesit', title: 'Bu hata mesajını neden sildik?', meta: [{ label: 'Tam yayın', value: 'YouTube' }] } },

  // ---- seriler
  {
    group: 'series',
    name: 'usta-notu-quote',
    kind: 'quote',
    size: 'ig-portrait',
    data: { quote: 'Hata mesajını kendine değil, kullanıcıya yaz. Gece üçte o mesajı okuyacak kişi sen olmayacaksın.', name: 'Usta adı', role: 'Usta', project: 'Açık Review · proje adı' },
  },
  {
    group: 'series',
    name: 'ilk-pr-quote',
    kind: 'quote',
    size: 'linkedin-square',
    theme: 'dark',
    data: { quote: 'İlk PR’ım 14 yorum aldı. Hepsi “şöyle denesek?” diye başlıyordu.', name: 'Katılımcı adı', role: 'Katılımcı', project: 'İlk katkı' },
  },
  {
    group: 'series',
    name: 'koina-haftasi',
    kind: 'stats',
    size: 'ig-square',
    data: {
      title: 'Koina Haftası: 12 haftada ilk ritim',
      period: '2–8 Kasım',
      items: [
        { value: '14', label: 'birleşen PR' },
        { value: '3', label: 'ilk katkı' },
        { value: '62', label: 'yeni üye' },
      ],
      days: Array.from({ length: 84 }, (_, i) => Math.max(0, Math.round(Math.sin(i * 1.7) * 3 + (i / 84) * 7 + ((i * 7) % 5) - 2))),
    },
  },
  {
    group: 'series',
    name: 'haftanin-commiti',
    kind: 'code',
    size: 'x-post',
    theme: 'dark',
    data: {
      title: 'Haftanın commit’i: hata mesajı kullanıcıya yazıldı',
      code: `// önce\nthrow new Error("ERR_42");\n\n// sonra\nthrow new Error("Dosya 10 MB'tan büyük. Daha küçük bir dosya seç.");`,
      caption: 'Tek satır, ama destek kanalına gelen soruların yarısını kesti.',
    },
  },
  {
    group: 'series',
    name: 'nasil-calisir',
    kind: 'carousel',
    size: 'ig-portrait',
    data: {
      title: 'Koina nasıl başlıyor?',
      subtitle: 'Sıra sıra: önce görünür iş, sonra birlikte üretim.',
      cards: [
        { heading: 'Şimdi: yayın ve kesit', body: 'Her Cumartesi 20:00 canlı kod yazıyoruz. En öğretici anlar kısa kesit olarak buraya geliyor.' },
        { heading: 'Sonra: konuk ustalar', body: 'Deneyimli geliştiriciler yayına gelir, gerçek PR’ları birlikte inceleriz.' },
        { heading: 'Sonra: topluluk', body: 'Eşli çalışma saatleri, fikir havuzu ve ilk açık kaynak katkıların.' },
        { heading: 'Sonra: ilk proje', body: 'Küçük bir ekiple bir projeyi baştan sona açıkta çıkarırız. Sezonlar ondan sonra.' },
      ],
      cta: { title: 'İlk adım kolay', body: 'YouTube’da abone ol, Cumartesi 20:00’de sohbete gel.' },
    },
  },

  // ---- yayın ekranları (OBS)
  { group: 'stream', name: 'starting', kind: 'stream', size: 'stream', theme: 'dark', data: { state: 'starting', title: 'Kodla Buluşma', subtitle: 'Sohbete yaz: bugün neyi çözüyoruz?' } },
  { group: 'stream', name: 'break', kind: 'stream', size: 'stream', theme: 'dark', data: { state: 'break', title: '5 dakikaya dönüyoruz', subtitle: 'discord.gg/koinadev' } },
  { group: 'stream', name: 'ending', kind: 'stream', size: 'stream', theme: 'dark', data: { state: 'ending', title: 'Bir sonraki yayın Cumartesi 20:00', subtitle: 'Kayıt ve kod: koina.dev' } },
  { group: 'stream', name: 'offline', kind: 'stream', size: 'stream', theme: 'light', data: { state: 'offline', title: 'Her Cumartesi 20:00', subtitle: 'Kodla Buluşma' } },
  { group: 'stream', name: 'lower-third', kind: 'lowerThird', size: 'stream', data: { name: 'Konuk adı', role: 'Usta · Proje adı' } },
];
