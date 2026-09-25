import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import {
  Save,
  RotateCcw,
  Sparkles,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Globe2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const {
    settings,
    updateHero,
    updateSdgImpact,
    updateAccessibilityDefaults,
    updateAdminProfile,
    resetAllDataToDefaults,
  } = useDataStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Form states initialized from settings
  const [heroForm, setHeroForm] = useState(settings.hero);
  const [sdgForm, setSdgForm] = useState(settings.sdgImpact);
  const [accForm, setAccForm] = useState(settings.accessibilityDefaults);
  const [profileForm, setProfileForm] = useState(settings.adminProfile);
  const [newPassword, setNewPassword] = useState('');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero(heroForm);
    updateSdgImpact(sdgForm);
    updateAccessibilityDefaults(accForm);
    updateAdminProfile(profileForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDatabase = () => {
    resetAllDataToDefaults();
    setResetModalOpen(false);
    // Reload local forms
    setHeroForm(settings.hero);
    setSdgForm(settings.sdgImpact);
    setAccForm(settings.accessibilityDefaults);
    setProfileForm(settings.adminProfile);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Pengaturan Beranda & Sistem CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi hero landing page, narasi dampak SDGs, standar awal aksesibilitas, dan profil pengelola.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data JSON Awal</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Seluruh pembaruan pengaturan berhasil disimpan dan diterapkan ke sistem!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8 text-xs">
        {/* 1. HERO & BANNER CONFIGURATION */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              1. Konfigurasi Hero & Banner Beranda (Landing Page)
            </h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Badge Pengantar Hero</label>
              <input
                type="text"
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Judul Utama Hero</label>
              <input
                type="text"
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif text-sm font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Subjudul / Narasi Pengantar</label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">URL Gambar Banner Utama</label>
              <input
                type="url"
                value={heroForm.bannerImage}
                onChange={(e) => setHeroForm({ ...heroForm, bannerImage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Teks Tombol Aksi Utama (CTA 1)</label>
                <input
                  type="text"
                  value={heroForm.primaryCtaText}
                  onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Teks Tombol Sekunder (CTA 2)</label>
                <input
                  type="text"
                  value={heroForm.secondaryCtaText}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. SECTION SDGS / DAMPAK GLOBAL */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Globe2 className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              2. Section SDGs & Dampak Edukatif Berkelanjutan
            </h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tagline Orientasi Capaian</label>
              <input
                type="text"
                value={sdgForm.tagline}
                onChange={(e) => setSdgForm({ ...sdgForm, tagline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Uraian Komitmen Global</label>
              <textarea
                rows={2}
                value={sdgForm.description}
                onChange={(e) => setSdgForm({ ...sdgForm, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* 3. GLOBAL ACCESSIBILITY PRESETS */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              3. Konfigurasi Standar Awal Aksesibilitas (Global Presets)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Skema Kontras Standar Awal</label>
              <select
                value={accForm.contrastScheme}
                onChange={(e) => setAccForm({ ...accForm, contrastScheme: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                <option value="normal">Normal (Default)</option>
                <option value="monochrome">Monokrom</option>
                <option value="dark-contrast">Kontras Gelap</option>
                <option value="high-contrast">Kontras Tinggi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bahasa Standar Awal</label>
              <select
                value={accForm.interfaceLanguage}
                onChange={(e) => setAccForm({ ...accForm, interfaceLanguage: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. MANAJEMEN PROFIL ADMIN */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              4. Manajemen Profil Administrator & Kata Sandi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Administrator</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Peran / Jabatan Akademik</label>
              <input
                type="text"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Ganti Kata Sandi (Opsional)</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi baru..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4 text-chem-glow" />
            <span>Simpan Semua Pengaturan CMS</span>
          </button>
        </div>
      </form>

      {/* Confirmation Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">Reset Seluruh Database?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan mengembalikan seluruh data materi, aktivitas, kuis, dan pengaturan ke data awal berkas JSON.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
