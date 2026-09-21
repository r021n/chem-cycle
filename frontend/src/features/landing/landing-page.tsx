import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { Material } from '../../types/material';
import { MaterialReaderModal } from '../../components/materials/MaterialReaderModal';

const FAQS = [
  {
    question: 'Apa materi pokok yang dipelajari di ChemCycle?',
    answer:
      'ChemCycle menyediakan materi pembelajaran kimia yang mencakup berbagai topik penting sesuai kurikulum SMA/MA, dari konsep dasar hingga analisis kuantitatif.',
  },
  {
    question: 'Apakah ChemCycle memfasilitasi praktikum?',
    answer:
      'Ya! ChemCycle menyajikan panduan praktikum berbasis Problem-Based Learning (PBL), simulasi interaktif, serta bank latihan bertahap.',
  },
  {
    question: 'Apa perbedaan akun Siswa dan akun Guru?',
    answer:
      'Siswa dapat mengakses modul materi, mengerjakan kuis, dan berdiskusi. Guru memiliki fitur tambahan untuk membuat/mengedit materi, mengelola bank soal, serta memonitor hasil belajar siswa.',
  },
  {
    question: 'Apakah aplikasi bisa diakses gratis?',
    answer:
      'Ya! ChemCycle sepenuhnya gratis dan responsif, nyaman dibuka melalui komputer, laptop, tablet, maupun smartphone.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenSampleReader = () => {
    const sampleMaterial: Material = {
      id: 'mat-kimia-demo',
      moduleId: 'mod-kimia-demo',
      title: 'Konsep Dasar Energi dan Interaksi dalam Reaksi Kimia',
      slug: 'konsep-dasar-energi-reaksi-kimia',
      summary:
        'Pelajari bagaimana energi berpindah dan berubah bentuk dalam berbagai reaksi kimia di kehidupan sehari-hari.',
      estimatedReadTime: 7,
      orderIndex: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contentJson: JSON.stringify([
        {
          id: 'b-1',
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: '1. Energi dalam Reaksi Kimia' }],
        },
        {
          id: 'b-2',
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Setiap reaksi kimia melibatkan perubahan energi. Energi dapat berpindah antara sistem reaksi dan lingkungan di sekitarnya dalam berbagai bentuk, seperti kalor, kerja, dan energi potensial.',
            },
          ],
        },
        {
          id: 'b-3',
          type: 'quote',
          content: [
            {
              type: 'text',
              text: 'Hukum Kekekalan Energi: Energi tidak dapat diciptakan maupun dimusnahkan. Jumlah energi dalam sistem tertutup selalu tetap, hanya berpindah atau berubah bentuk.',
            },
          ],
        },
        {
          id: 'b-4',
          type: 'heading',
          props: { level: 3 },
          content: [{ type: 'text', text: '2. Reaksi Eksoterm vs Endoterm' }],
        },
        {
          id: 'b-5',
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Reaksi eksoterm melepaskan energi ke lingkungan (suhu naik), seperti pada respirasi seluler dan pembakaran. Sebaliknya, reaksi endoterm menyerap energi dari lingkungan (suhu turun), seperti pada fotosintesis dan pelarutan senyawa tertentu.',
            },
          ],
        },
      ]),
    };
    setReadingMaterial(sampleMaterial);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg text-chem-dark selection:bg-chem-glow selection:text-chem-forest flex flex-col antialiased font-sans">
      {/* 1. PUBLIC TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-chem-paper/90 backdrop-blur-md border-b border-chem-border/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group select-none">
            <div className="w-10 h-10 rounded-2xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 spin-orbital" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" strokeDasharray="2 2" />
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="font-serif italic text-xl font-medium tracking-tight text-chem-dark">
                Chem<span className="font-sans font-bold not-italic text-chem-sage tracking-normal">Cycle</span>
              </span>
              <span className="hidden sm:block text-[10px] font-sans font-semibold tracking-wider uppercase text-chem-ash">
                Platform Pembelajaran Kimia
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-chem-ash">
            <button
              type="button"
              onClick={() => scrollToSection('fitur')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Fitur
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('peran')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Siswa & Guru
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-2xl shadow-subtle flex items-center gap-2 transition-transform active:scale-95"
                >
                  <i className="fa-solid fa-gauge-high text-xs"></i>
                  <span>Buka Dashboard</span>
                </Link>
                <div className="flex items-center gap-2 pl-1 text-left">
                  <div className="w-8 h-8 rounded-full bg-chem-subtle border border-chem-border flex items-center justify-center font-bold text-xs text-chem-forest">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-xs font-semibold text-chem-dark hover:text-chem-forest hover:bg-chem-subtle rounded-xl transition-colors"
                >
                  Masuk Akun
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4.5 py-2.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-2xl shadow-subtle flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <i className="fa-solid fa-user-plus text-xs text-chem-mint"></i>
                  <span>Daftar Gratis</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu Navigasi"
              className="p-2 text-chem-ash hover:text-chem-dark rounded-xl hover:bg-chem-subtle transition-colors cursor-pointer"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-chem-border/80 bg-white/95 backdrop-blur-md px-5 py-5 space-y-4">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-chem-dark">
              <button
                type="button"
                onClick={() => scrollToSection('fitur')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Fitur
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('peran')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Siswa & Guru
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                FAQ
              </button>
            </nav>

            <div className="pt-3 border-t border-chem-border/70 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-chem-forest text-chem-glow font-bold text-xs rounded-xl shadow-xs"
                >
                  Buka Dashboard Belajar
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 border border-chem-border text-chem-dark font-semibold text-xs rounded-xl hover:bg-chem-subtle"
                  >
                    Masuk ke Akun
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-chem-forest text-chem-glow font-bold text-xs rounded-xl shadow-xs"
                  >
                    Daftar Akun Baru (Gratis)
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-chem-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chem-glow/60 border border-chem-sage/30 text-chem-forest text-xs font-semibold">
              <i className="fa-solid fa-flask text-chem-sage text-xs"></i>
              <span>Platform Pembelajaran Kimia SMA / MA (Fase F)</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-chem-dark leading-[1.15] tracking-tight">
              Kuasai Konsep Kimia & <br className="hidden sm:inline" />
              <span className="italic text-chem-moss">Analisis Reaksi Kimia</span>
            </h1>

            <p className="text-sm sm:text-base text-chem-ash leading-relaxed max-w-xl mx-auto">
              Modul editorial interaktif, kuis adaptif, dan praktikum berbasis PBL—semua yang Anda butuhkan untuk memahami kimia secara mendalam.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-sm font-bold rounded-2xl shadow-float flex items-center gap-2.5 transition-transform active:scale-95"
                >
                  <i className="fa-solid fa-gauge-high"></i>
                  <span>Masuk ke Dashboard Belajar</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="px-6 py-3.5 bg-chem-forest hover:bg-chem-dark text-chem-glow text-sm font-bold rounded-2xl shadow-float flex items-center gap-2.5 transition-transform active:scale-95"
                  >
                    <span>Mulai Belajar Sekarang</span>
                    <i className="fa-solid fa-arrow-right text-xs text-chem-mint"></i>
                  </Link>
                  <Link
                    to="/auth/login"
                    className="px-5 py-3.5 bg-white hover:bg-chem-subtle text-chem-dark border border-chem-border text-sm font-semibold rounded-2xl transition-colors"
                  >
                    Masuk ke Akun
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={handleOpenSampleReader}
                className="px-5 py-3.5 bg-chem-subtle hover:bg-chem-glow/50 text-chem-forest border border-chem-border/70 text-sm font-semibold rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-book-open-reader text-xs text-chem-sage"></i>
                <span>Baca Modul Sampel</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: FITUR-FITUR UNGGULAN APLIKASI */}
      <section id="fitur" className="py-20 bg-white/70 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Fitur Unggulan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              Belajar Kimia Jadi Lebih Mudah
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Modul Interaktif
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Materi terstruktur dengan format blok, diagram, dan catatan konsep penting. Dilengkapi mode Zen Reader.
              </p>
            </div>

            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Zen Quiz
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Kuis tanpa tekanan waktu dengan kunci jawaban instan dan pembahasan ilmiah di tiap nomor.
              </p>
            </div>

            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-flask"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Praktikum PBL
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Instruksi eksperimen berbasis Problem-Based Learning dengan panduan lembar kerja lengkap.
              </p>
            </div>

            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-gauge-high"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Dashboard Belajar
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Pantau modul yang sudah dibaca, statistik skor kuis, dan progres belajar secara real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: DUA PERAN (SISWA & GURU) */}
      <section id="peran" className="py-20 bg-white/70 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Didesain untuk Dua Peran
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              Fasilitas Terpadu untuk Siswa & Guru Kimia
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              ChemCycle menjembatani interaksi antara kemandirian belajar siswa dengan fleksibilitas pengelolaan kelas oleh guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Siswa */}
            <div className="p-8 rounded-3xl bg-chem-paper border border-chem-border shadow-float space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-chem-sage uppercase tracking-wider">
                    Bagi Peserta Didik
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-chem-dark">
                    Ruang Belajar Siswa
                  </h3>
                </div>
              </div>

              <p className="text-xs text-chem-ash leading-relaxed">
                Belajar mandiri dengan ritme sendiri. Akses modul kimia, kerjakan kuis, dan pantau progres belajar di dashboard pribadi.
              </p>

              <div className="space-y-3 border-t border-chem-border/70 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Modul materi kimia lengkap kapan pun</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Kuis latihan dengan pembahasan instan</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Forum diskusi kimia yang bersahabat</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/auth/register"
                  className="w-full py-3 px-4 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-2xl shadow-subtle flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>Daftar Sebagai Siswa</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>

            {/* Card Guru */}
            <div className="p-8 rounded-3xl bg-white border border-chem-border shadow-float space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-chem-sage uppercase tracking-wider">
                    Bagi Guru & Pendidik Kimia
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-chem-dark">
                    Portal Manajemen Guru
                  </h3>
                </div>
              </div>

              <p className="text-xs text-chem-ash leading-relaxed">
                Kelola bahan ajar dan evaluasi kimia. Rancang modul, susun bank soal, dan monitor pemahaman siswa secara real-time.
              </p>

              <div className="space-y-3 border-t border-chem-border/70 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Block Editor untuk menyusun materi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Pembuatan kuis dan kunci jawaban</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Pemantauan progres siswa real-time</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/auth/login"
                  className="w-full py-3 px-4 bg-chem-subtle hover:bg-chem-glow/60 text-chem-forest border border-chem-border text-xs font-bold rounded-2xl shadow-subtle flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>Masuk Akun Guru</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: FAQ (TANYA JAWAB) */}
      <section id="faq" className="py-20 border-b border-chem-border/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Pertanyaan yang Kerap Diajukan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              Tanya Jawab Seputar ChemCycle
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              Temukan informasi seputar kurikulum, materi kimia, dan akses platform.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-chem-border overflow-hidden transition-all shadow-subtle"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-chem-subtle/50 transition-colors"
                  >
                    <span className="font-serif text-base font-semibold text-chem-dark">
                      {faq.question}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-chem-ash transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-chem-sage' : ''
                      }`}
                    ></i>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-chem-ash leading-relaxed border-t border-chem-border/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. SECTION: CALL TO ACTION BANNER */}
      <section className="py-20 bg-chem-forest text-chem-glow relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-chem-glow/20 text-chem-glow text-xs font-semibold">
            <i className="fa-solid fa-fire-flame-curved text-amber-300"></i>
            <span>Tingkatkan Pemahaman Kimia Anda Sekarang</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
            Siap Menguasai Konsep Kimia & <br />
            <span className="italic text-chem-mint">Analisis Reaksi Kimia?</span>
          </h2>

          <p className="text-xs sm:text-sm text-chem-glow/80 max-w-2xl mx-auto leading-relaxed">
            Daftarkan akun sekarang untuk membuka modul kimia terstruktur, mencoba kuis Zen dengan kunci dan pembahasan, serta berdiskusi bersama teman dan guru.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 bg-chem-mint hover:bg-emerald-400 text-chem-dark text-xs sm:text-sm font-bold rounded-2xl shadow-float transition-transform active:scale-95"
              >
                Buka Dashboard Saya
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/register"
                  className="px-8 py-3.5 bg-chem-mint hover:bg-emerald-400 text-chem-dark text-xs sm:text-sm font-bold rounded-2xl shadow-float transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span>Daftar Akun Baru (Gratis)</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
                <Link
                  to="/auth/login"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-chem-glow/30 text-white text-xs sm:text-sm font-semibold rounded-2xl transition-colors"
                >
                  Masuk ke Akun
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative background glow rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-chem-mint/20 blur-3xl pointer-events-none"></div>
      </section>

      {/* 10. PUBLIC FOOTER */}
      <footer className="bg-white border-t border-chem-border/80 text-chem-ash font-sans py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & Overview */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 spin-orbital" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" strokeDasharray="2 2" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-serif italic text-lg font-bold text-chem-dark">
                  Chem<span className="font-sans font-bold not-italic text-chem-sage">Cycle</span>
                </span>
              </div>
              <p className="text-xs text-chem-ash leading-relaxed max-w-md">
                Platform pembelajaran kimia SMA/MA interaktif yang mengintegrasikan modul editorial Notion-style, kuis adaptif tanpa cemas, instruksi eksperimen laboratorium, dan komunitas diskusi ilmiah.
              </p>
              <div className="flex items-center gap-2 text-xs text-chem-forest font-semibold">
                <i className="fa-solid fa-atom text-chem-sage"></i>
                <span>Kurikulum Merdeka & K13 — Kimia SMA/MA Fase F</span>
              </div>
            </div>

            {/* Column 2: Navigasi Cepat */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-chem-dark">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fitur')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Fitur
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Akses Akun */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-chem-dark">
                Akses Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/auth/login" className="hover:text-chem-dark transition-colors">
                    Masuk ke Akun
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" className="hover:text-chem-dark transition-colors">
                    Daftar Akun Baru
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-chem-dark transition-colors">
                    Dashboard Belajar
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenSampleReader}
                    className="hover:text-chem-dark transition-colors cursor-pointer text-left"
                  >
                    Baca Modul Sampel
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-chem-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-chem-ash">
            <p>
              Hak Cipta © {new Date().getFullYear()} ChemCycle. Seluruh hak cipta dilindungi undang-undang.
            </p>
            <p className="text-[11px] text-chem-ash/80">
              Chemistry Learning Platform — Media Pembelajaran Kimia SMA
            </p>
          </div>
        </div>
      </footer>

      {/* Reader Modal (Sample Preview) */}
      {readingMaterial && (
        <MaterialReaderModal
          material={readingMaterial}
          isOpen={!!readingMaterial}
          onClose={() => setReadingMaterial(null)}
          onEdit={() => {
            setReadingMaterial(null);
            navigate('/auth/login');
          }}
        />
      )}
    </div>
  );
};

export default LandingPage;
