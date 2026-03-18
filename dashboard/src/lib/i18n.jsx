import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    // Nav
    "nav.overview": "Overview",
    "nav.platforms": "Platforms",
    "nav.donations": "Donations",
    "nav.filter": "Filter",
    "nav.sandbox": "Sandbox",
    "nav.signout": "Sign Out",

    // Overview
    "overview.welcome": "Welcome back, {name} 👋",
    "overview.filterActive": "Your filter is active and protecting your stream.",
    "overview.filterDisabled": "⚠️ Your filter is currently disabled.",
    "overview.total": "Total",
    "overview.passed": "Passed",
    "overview.blocked": "Blocked",
    "overview.blockRate": "{rate}% block rate",
    "overview.quickSetup": "Quick Setup",
    "overview.donationPlatforms": "Donation Platforms",
    "overview.webhookDesc": "Webhook URLs to receive donations",
    "overview.obsOverlay": "OBS Overlay",
    "overview.obsDesc": "Browser Source to display donations",
    "overview.obsGuide": "Open OBS → Sources → + → Browser → paste the URL above. Recommended: 800×600, empty custom CSS.",
    "overview.recentActivity": "Recent Activity",
    "overview.noActivity": "No activity yet",

    // Donations
    "donations.title": "Donation History",
    "donations.total": "{count} total",
    "donations.exportCsv": "Export CSV",
    "donations.refresh": "↻ Refresh",
    "donations.all": "All",
    "donations.passed": "Passed",
    "donations.blocked": "Blocked",
    "donations.search": "Search donator or message...",
    "donations.selectAll": "Select all blocked ({count})",
    "donations.approveSelected": "Approve {count} selected",
    "donations.approving": "Approving...",
    "donations.loading": "Loading donations...",
    "donations.noMatch": "No matching donations",
    "donations.noResults": 'No results for "{search}"',
    "donations.noFound": "No donations found",
    "donations.willAppear": "Donations will appear here when they come in",
    "donations.noYet": "No {filter} donations yet",
    "donations.approve": "Approve",
    "donations.noMessage": "(no message)",
    "donations.prev": "← Prev",
    "donations.next": "Next →",
    "donations.page": "Page {page} of {total}",
    "donations.csvDone": "CSV downloaded",
    "donations.approved": "Donation approved & sent to overlay",

    // Filter
    "filter.title": "Filter Settings",
    "filter.nlpTitle": "NLP Judol Filter",
    "filter.active": "Active — gambling spam is being filtered",
    "filter.disabled": "Disabled — all donations pass through",
    "filter.highKeywords": "High-confidence keywords",
    "filter.ctxKeywords": "Context keywords",
    "filter.regexPatterns": "Regex patterns",
    "filter.pipeline": "Filter Pipeline",
    "filter.pipelineDesc": "Messages pass through each layer in sequence",
    "filter.normalization": "Normalization",
    "filter.normDesc": "Clean & normalize text",
    "filter.blocklist": "Blocklist",
    "filter.blockDesc": "Custom blocked words",
    "filter.keywords": "Keywords",
    "filter.keyDesc": "High-confidence match",
    "filter.regex": "Regex",
    "filter.regexDesc": "Pattern-based detection",
    "filter.ml": "ML",
    "filter.mlDesc": "Coming soon",
    "filter.customBlocklist": "Custom Blocklist",
    "filter.customDesc": "Block additional words beyond the built-in judol filter",
    "filter.addPlaceholder": "Add word to block...",
    "filter.add": "Add",
    "filter.noWords": "No custom words added",

    // Sandbox
    "sandbox.title": "Testing Sandbox",
    "sandbox.desc": "Test the filter without real donations. See what gets blocked and what passes.",
    "sandbox.sendTest": "Send Test Donation",
    "sandbox.donator": "Donator",
    "sandbox.amount": "Amount (Rp)",
    "sandbox.message": "Message",
    "sandbox.msgPlaceholder": "Type donation message to test...",
    "sandbox.send": "Send Test",
    "sandbox.presets": "Presets",
    "sandbox.overlayPreview": "Overlay Preview",
    "sandbox.showOverlay": "Click Show to preview your OBS overlay live",
    "sandbox.results": "Results",
    "sandbox.noResults": "Send a test to see results",

    // Platforms
    "platforms.title": "Platform Integration",
    "platforms.desc": "Connect your donation platform to enable spam filtering",
    "platforms.active": "Active",
    "platforms.soon": "Soon",
    "platforms.trakteerGuide": "Trakteer Setup Guide",
    "platforms.saweriaGuide": "Saweria Setup Guide",
    "platforms.steps": "Steps",
    "platforms.stepByStep": "Step by step",

    // Auth
    "auth.back": "← Back to home",
    "auth.tagline": "Protect your stream from gambling spam",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.username": "Username",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.usernamePh": "Your stream name",
    "auth.emailPh": "streamer@example.com",
    "auth.passwordPh": "Min 6 characters",
    "auth.createAccount": "Create Account",
    "auth.signIn": "Sign In",

    // Common
    "common.loading": "Loading...",
    "common.hide": "Hide",
    "common.show": "Show",
  },

  id: {
    // Nav
    "nav.overview": "Ringkasan",
    "nav.platforms": "Platform",
    "nav.donations": "Donasi",
    "nav.filter": "Filter",
    "nav.sandbox": "Sandbox",
    "nav.signout": "Keluar",

    // Overview
    "overview.welcome": "Selamat datang, {name} 👋",
    "overview.filterActive": "Filter kamu aktif dan melindungi stream.",
    "overview.filterDisabled": "⚠️ Filter kamu sedang nonaktif.",
    "overview.total": "Total",
    "overview.passed": "Lolos",
    "overview.blocked": "Diblokir",
    "overview.blockRate": "{rate}% diblokir",
    "overview.quickSetup": "Setup Cepat",
    "overview.donationPlatforms": "Platform Donasi",
    "overview.webhookDesc": "URL Webhook untuk menerima donasi",
    "overview.obsOverlay": "OBS Overlay",
    "overview.obsDesc": "Browser Source untuk tampilkan donasi",
    "overview.obsGuide": "Buka OBS → Sources → + → Browser → paste URL di atas. Rekomendasi: 800×600, custom CSS kosong.",
    "overview.recentActivity": "Aktivitas Terbaru",
    "overview.noActivity": "Belum ada aktivitas",

    // Donations
    "donations.title": "Riwayat Donasi",
    "donations.total": "{count} total",
    "donations.exportCsv": "Ekspor CSV",
    "donations.refresh": "↻ Muat ulang",
    "donations.all": "Semua",
    "donations.passed": "Lolos",
    "donations.blocked": "Diblokir",
    "donations.search": "Cari donatur atau pesan...",
    "donations.selectAll": "Pilih semua diblokir ({count})",
    "donations.approveSelected": "Setujui {count} terpilih",
    "donations.approving": "Menyetujui...",
    "donations.loading": "Memuat donasi...",
    "donations.noMatch": "Tidak ada donasi yang cocok",
    "donations.noResults": 'Tidak ada hasil untuk "{search}"',
    "donations.noFound": "Tidak ada donasi",
    "donations.willAppear": "Donasi akan muncul di sini saat masuk",
    "donations.noYet": "Belum ada donasi {filter}",
    "donations.approve": "Setujui",
    "donations.noMessage": "(tanpa pesan)",
    "donations.prev": "← Sblm",
    "donations.next": "Slnjt →",
    "donations.page": "Hal {page} dari {total}",
    "donations.csvDone": "CSV terunduh",
    "donations.approved": "Donasi disetujui & dikirim ke overlay",

    // Filter
    "filter.title": "Pengaturan Filter",
    "filter.nlpTitle": "Filter NLP Judol",
    "filter.active": "Aktif — spam judi sedang difilter",
    "filter.disabled": "Nonaktif — semua donasi lolos",
    "filter.highKeywords": "Kata kunci utama",
    "filter.ctxKeywords": "Kata kunci konteks",
    "filter.regexPatterns": "Pola regex",
    "filter.pipeline": "Alur Filter",
    "filter.pipelineDesc": "Pesan melewati setiap lapisan secara berurutan",
    "filter.normalization": "Normalisasi",
    "filter.normDesc": "Bersihkan & normalisasi teks",
    "filter.blocklist": "Blocklist",
    "filter.blockDesc": "Kata kustom yang diblokir",
    "filter.keywords": "Kata Kunci",
    "filter.keyDesc": "Pencocokan tinggi",
    "filter.regex": "Regex",
    "filter.regexDesc": "Deteksi berbasis pola",
    "filter.ml": "ML",
    "filter.mlDesc": "Segera hadir",
    "filter.customBlocklist": "Blocklist Kustom",
    "filter.customDesc": "Blokir kata tambahan di luar filter judol bawaan",
    "filter.addPlaceholder": "Tambah kata untuk diblokir...",
    "filter.add": "Tambah",
    "filter.noWords": "Belum ada kata kustom",

    // Sandbox
    "sandbox.title": "Sandbox Pengujian",
    "sandbox.desc": "Uji filter tanpa donasi asli. Lihat mana yang diblokir dan mana yang lolos.",
    "sandbox.sendTest": "Kirim Donasi Test",
    "sandbox.donator": "Donatur",
    "sandbox.amount": "Jumlah (Rp)",
    "sandbox.message": "Pesan",
    "sandbox.msgPlaceholder": "Ketik pesan donasi untuk diuji...",
    "sandbox.send": "Kirim Test",
    "sandbox.presets": "Preset",
    "sandbox.overlayPreview": "Preview Overlay",
    "sandbox.showOverlay": "Klik Show untuk preview overlay OBS",
    "sandbox.results": "Hasil",
    "sandbox.noResults": "Kirim test untuk lihat hasil",

    // Platforms
    "platforms.title": "Integrasi Platform",
    "platforms.desc": "Hubungkan platform donasi untuk mengaktifkan filter spam",
    "platforms.active": "Aktif",
    "platforms.soon": "Segera",
    "platforms.trakteerGuide": "Panduan Setup Trakteer",
    "platforms.saweriaGuide": "Panduan Setup Saweria",
    "platforms.steps": "Langkah-langkah",
    "platforms.stepByStep": "Langkah demi langkah",

    // Auth
    "auth.back": "← Kembali ke beranda",
    "auth.tagline": "Lindungi stream kamu dari spam judi",
    "auth.login": "Masuk",
    "auth.register": "Daftar",
    "auth.username": "Username",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.usernamePh": "Nama stream kamu",
    "auth.emailPh": "streamer@contoh.com",
    "auth.passwordPh": "Min 6 karakter",
    "auth.createAccount": "Buat Akun",
    "auth.signIn": "Masuk",

    // Common
    "common.loading": "Memuat...",
    "common.hide": "Sembunyikan",
    "common.show": "Tampilkan",
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("sg_lang") || "id");

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("sg_lang", l);
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  };

  return (
    <LangContext.Provider value={{ t, lang, setLang: changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
