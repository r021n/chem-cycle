import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { Material } from '../../types/material';
import { MaterialReaderModal } from '../../components/materials/MaterialReaderModal';

interface ConceptInfo {
  id: string;
  name: string;
  formula: string;
  badge: string;
  icon: string;
  colorClass: string;
  focus: string;
  summary: string;
  keyPoints: { step: string; title: string; desc: string }[];
  application: string;
}

const THERMOCHEM_CONCEPTS: ConceptInfo[] = [
  {
    id: 'sistem-lingkungan',
    name: 'Sistem & Lingkungan',
    formula: 'ΔE = q + w',
    badge: 'Fondasi Termodinamika Kimia',
    icon: 'fa-cube',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    focus: 'Pertukaran Energi Kalor & Materi',
    summary:
      'Sistem adalah bagian dari alam semesta yang menjadi pusat perhatian pengamatan kimia, sedangkan lingkungan adalah segala sesuatu di luar sistem. Berdasarkan interaksinya, sistem dibedakan menjadi terbuka, tertutup, dan terisolasi.',
    keyPoints: [
      { step: '1', title: 'Sistem Terbuka', desc: 'Dapat bertukar materi dan kalor secara bebas dengan lingkungan (contoh: bejana terbuka).' },
      { step: '2', title: 'Sistem Tertutup', desc: 'Hanya bertukar energi kalor, materi tertahan di dalam batas sistem (contoh: labu tertutup).' },
      { step: '3', title: 'Sistem Terisolasi', desc: 'Tidak ada pertukaran materi maupun kalor dengan lingkungan sama sekali (contoh: termos ideal).' },
      { step: '4', title: 'Hukum Kekekalan Energi', desc: 'Energi tidak dapat diciptakan atau dimusnahkan, hanya berpindah atau berubah bentuk (Azas Pertama Termodinamika).' },
    ],
    application: 'Dasar perancangan reaktor kimia, isolasi termal industri, dan pemahaman reaksi biokimia dalam sel.',
  },
  {
    id: 'reaksi-entalpi',
    name: 'Eksoterm & Endoterm',
    formula: 'ΔH = Hproduk - Hreaktan',
    badge: 'Arah Aliran Kalor Reaksi',
    icon: 'fa-fire-flame-curved',
    colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
    focus: 'Perubahan Entalpi (ΔH < 0 vs ΔH > 0)',
    summary:
      'Entalpi (H) menyatakan kandungan energi kalor suatu zat pada tekanan tetap. Reaksi eksoterm melepaskan kalor ke lingkungan sehingga suhu wadah naik (ΔH bernilai negatif), sedangkan reaksi endoterm menyerap kalor dari lingkungan sehingga suhu turun (ΔH positif).',
    keyPoints: [
      { step: '1', title: 'Reaksi Eksoterm', desc: 'Kalor berpindah dari sistem ke lingkungan. Nilai ΔH < 0, suhu lingkungan meningkat (contoh: pembakaran gas metana).' },
      { step: '2', title: 'Reaksi Endoterm', desc: 'Sistem menyerap kalor dari lingkungan. Nilai ΔH > 0, suhu lingkungan menurun (contoh: pelarutan urea dalam air).' },
      { step: '3', title: 'Diagram Tingkat Energi', desc: 'Grafik koordinat reaksi yang menggambarkan perbedaan energi potensial antara keadaan reaktan dan produk.' },
      { step: '4', title: 'Persamaan Termokimia', desc: 'Penulisan reaksi stoikiometri lengkap dengan fase zat dan nilai perubahan entalpi reaksinya.' },
    ],
    application: 'Kompres dingin & panas instan medis, pembakaran bahan bakar roket, dan sintesis material endotermik.',
  },
  {
    id: 'entalpi-standar',
    name: 'Perubahan Entalpi Standar',
    formula: 'ΔH°f, ΔH°d, ΔH°c, ΔH°n',
    badge: 'Kondisi Standar (298 K, 1 atm)',
    icon: 'fa-gauge',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
    focus: 'Karakterisasi Entalpi Reaksi Spesifik',
    summary:
      'Perubahan entalpi yang diukur pada kondisi standar (25°C dan 1 atm) untuk 1 mol zat. Meliputi entalpi pembentukan standar (ΔH°f), penguraian (ΔH°d), pembakaran sempurna (ΔH°c), dan netralisasi asam-basa (ΔH°n).',
    keyPoints: [
      { step: '1', title: 'Pembentukan (ΔH°f)', desc: 'Kalor pembentukan 1 mol senyawa dari unsur-unsurnya dalam bentuk paling stabil di alam.' },
      { step: '2', title: 'Penguraian (ΔH°d)', desc: 'Kalor penguraian 1 mol senyawa menjadi unsur-unsur pembentuknya (kebalikan dari ΔH°f).' },
      { step: '3', title: 'Pembakaran (ΔH°c)', desc: 'Kalor yang dilepaskan pada pembakaran sempurna 1 mol zat dengan gas oksigen.' },
      { step: '4', title: 'Netralisasi (ΔH°n)', desc: 'Kalor reaksi asam dan basa yang menghasilkan 1 mol air (H₂O) pada kondisi standar.' },
    ],
    application: 'Perhitungan efisiensi nilai kalori bahan bakar komersial dan standarisasi data termodinamika internasional.',
  },
  {
    id: 'hukum-hess-kalorimetri',
    name: 'Hukum Hess & Kalorimetri',
    formula: 'q = m · c · ΔT | ΔH = ΣΔH°f(prod) - ΣΔH°f(reak)',
    badge: 'Kalkulasi & Eksperimen Kalor',
    icon: 'fa-flask-vial',
    colorClass: 'text-violet-700 bg-violet-50 border-violet-200',
    focus: 'Penentuan Nilai ΔH Reaksi',
    summary:
      'Menurut Germain Henri Hess, perubahan entalpi reaksi hanya bergantung pada keadaan awal dan akhir, tidak bergantung pada jalannya reaksi. Di laboratorium, kalor reaksi dapat diukur secara langsung menggunakan bejana kalorimeter sederhana.',
    keyPoints: [
      { step: '1', title: 'Kalorimetri Laboratorium', desc: 'Mengukur perubahan suhu (ΔT) larutan dengan rumus q = m · c · ΔT + C · ΔT.' },
      { step: '2', title: 'Hukum Hess (Penjumlahan)', desc: 'Menghitung ΔH reaksi multi-tahap atau reaksi yang sulit diukur langsung dengan menjumlahkan tahap-tahap reaksinya.' },
      { step: '3', title: 'Data Entalpi Pembentukan', desc: 'Menghitung ΔH = Σ(n · ΔH°f produk) - Σ(m · ΔH°f reaktan) menggunakan tabel standar.' },
      { step: '4', title: 'Energi Ikatan Rata-rata', desc: 'Menghitung pemutusan ikatan reaktan dikurangi pembentukan ikatan produk (ΔH = ΣDpemutusan - ΣDpembentukan).' },
    ],
    application: 'Penentuan nilai kalor reaksi senyawa berbahaya tanpa praktikum langsung dan perhitungan energi ikatan biopolimer.',
  },
];

const FAQS = [
  {
    question: 'Apa materi pokok yang dipelajari di ChemCycle?',
    answer:
      'ChemCycle berfokus penuh pada penguasaan konsep Termokimia SMA/MA. Topik yang dibahas mencakup: Konsep Sistem dan Lingkungan, Hukum Kekekalan Energi, Reaksi Eksoterm dan Endoterm, Persamaan Termokimia, Jenis-jenis Perubahan Entalpi Standar (ΔH°), Penentuan ΔH dengan Kalorimetri, Hukum Hess, dan Energi Ikatan Rata-Rata.',
  },
  {
    question: 'Apakah ChemCycle memfasilitasi praktikum dan perhitungan kalor?',
    answer:
      'Tentu! ChemCycle menyajikan panduan praktikum kalorimeter sederhana berbasis Problem-Based Learning (PBL), simulasi interaktif perhitungan q = m · c · ΔT, serta bank latihan bertahap mulai dari pemahaman konsep kualitatif hingga perhitungan matematis Hukum Hess.',
  },
  {
    question: 'Bagaimana kurikulum yang menjadi acuan aplikasi ini?',
    answer:
      'ChemCycle dirancang selaras dengan Capaian Pembelajaran Kimia Fase F (Kelas XI SMA/MA) pada Kurikulum Merdeka dan Kompetensi Dasar Termokimia Kurikulum 2013, menekankan pemahaman konsep mendalam dan kemampuan bernalar kritis.',
  },
  {
    question: 'Apa perbedaan akun Siswa dan akun Guru?',
    answer:
      'Siswa dapat mengakses modul materi termokimia, mengerjakan latihan kuis formatif dengan pembahasan lengkap, mengunduh panduan praktikum/aktivitas kelas, dan berdiskusi. Guru memiliki fitur tambahan untuk membuat/mengedit materi dengan block editor, mengelola bank soal kuis, serta memonitor hasil pengerjaan kuis siswa secara real-time.',
  },
  {
    question: 'Apakah aplikasi bisa diakses gratis di ponsel atau laptop?',
    answer:
      'Ya! ChemCycle sepenuhnya gratis dan dibangun dengan desain web responsif yang nyaman dibuka melalui komputer, laptop, tablet, maupun smartphone.',
  },
  {
    question: 'Mengapa halaman dashboard dan materi meminta login?',
    answer:
      'Halaman beranda ini terbuka untuk publik agar siapa saja dapat melihat informasi platform. Namun, untuk membaca materi modul lengkap, mengerjakan kuis, menyimpan riwayat skor belajar, dan berdiskusi di kelas, Anda perlu masuk (login) agar data kemajuan belajar Anda tersimpan secara personal.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [activeConcept, setActiveConcept] = useState<string>('sistem-lingkungan');
  const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedConcept =
    THERMOCHEM_CONCEPTS.find((c) => c.id === activeConcept) || THERMOCHEM_CONCEPTS[0];

  const handleOpenSampleReader = () => {
    const sampleMaterial: Material = {
      id: 'mat-termokimia-demo',
      moduleId: 'mod-termo-demo',
      title: 'Konsep Sistem, Lingkungan, dan Aliran Kalor Reaksi Kimia',
      slug: 'konsep-sistem-lingkungan-termokimia',
      summary:
        'Pelajari bagaimana energi berpindah antara sistem reaksi dan lingkungan di sekitarnya berdasarkan azas kekekalan energi.',
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
          content: [{ type: 'text', text: '1. Batasan Sistem dan Lingkungan' }],
        },
        {
          id: 'b-2',
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Dalam termokimia, reaksi kimia yang kita amati disebut sebagai sistem. Misalnya, campuran larutan asam klorida (HCl) dan natrium hidroksida (NaOH) di dalam gelas kimia adalah sistem, sedangkan gelas kimia, udara ruangan, dan termometer di sekitarnya adalah lingkungan.',
            },
          ],
        },
        {
          id: 'b-3',
          type: 'quote',
          content: [
            {
              type: 'text',
              text: 'Azas Kekekalan Energi: Energi tidak dapat diciptakan maupun dimusnahkan. Kalor yang dilepaskan oleh sistem kimia sama dengan kalor yang diserap oleh lingkungan sekitarnya (qsistem + qlingkungan = 0).',
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
              text: 'Reaksi eksoterm melepaskan kalor ke lingkungan (suhu naik, ΔH < 0), seperti pada respirasi seluler dan pembakaran gas metana. Sebaliknya, reaksi endoterm menyerap kalor dari lingkungan (suhu turun, ΔH > 0), seperti pada fotosintesis dan pelarutan urea.',
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
                Atelier Pembelajaran Termokimia
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-chem-ash">
            <button
              type="button"
              onClick={() => scrollToSection('tentang')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Tentang
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('konsep')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Materi Termokimia
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('fitur')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Fitur Unggulan
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('alur')}
              className="hover:text-chem-forest transition-colors cursor-pointer"
            >
              Alur Belajar
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
                onClick={() => scrollToSection('tentang')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Tentang ChemCycle
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('konsep')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Materi Termokimia
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('fitur')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Fitur Unggulan
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('alur')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Alur Pembelajaran
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('peran')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Untuk Siswa & Guru
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 hover:text-chem-forest transition-colors"
              >
                Tanya Jawab (FAQ)
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chem-glow/60 border border-chem-sage/30 text-chem-forest text-xs font-semibold">
                <i className="fa-solid fa-fire text-amber-600 text-xs"></i>
                <span>Platform Pembelajaran Termokimia SMA / MA (Fase F)</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-chem-dark leading-[1.15] tracking-tight">
                Kuasai Dinamika Energi & <br className="hidden sm:inline" />
                <span className="italic text-chem-moss">Kalor Reaksi Kimia</span>
              </h1>

              <p className="text-sm sm:text-base text-chem-ash leading-relaxed max-w-2xl mx-auto lg:mx-0">
                ChemCycle memudahkan Anda memahami materi Termokimia secara mendalam—mulai dari sistem & lingkungan, reaksi eksoterm-endoterm, penentuan entalpi kalorimetri, hingga Hukum Hess dan energi ikatan—melalui modul editorial interaktif dan evaluasi mandiri adaptif.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
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
                  <span>Baca Modul Termokimia Sampel</span>
                </button>
              </div>

              {/* Key Features Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-chem-border/60 max-w-xl mx-auto lg:mx-0">
                <div className="space-y-1">
                  <span className="block font-serif text-2xl font-bold text-chem-forest">ΔH & Kalor</span>
                  <span className="block text-[11px] text-chem-ash">Eksoterm & Endoterm</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-serif text-2xl font-bold text-chem-forest">Hukum Hess</span>
                  <span className="block text-[11px] text-chem-ash">Kalkulasi Tahap Reaksi</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-serif text-2xl font-bold text-chem-forest">Kalorimetri</span>
                  <span className="block text-[11px] text-chem-ash">Praktikum Inkuiri (PBL)</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-serif text-2xl font-bold text-chem-forest">Zen Exam</span>
                  <span className="block text-[11px] text-chem-ash">Kuis + Pembahasan Detail</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 rounded-3xl p-6 sm:p-7 border border-chem-border shadow-float relative space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-chem-border/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-chem-forest uppercase tracking-wider">
                      Pratinjau Topik Termokimia
                    </span>
                  </div>
                  <span className="text-[11px] text-chem-ash bg-chem-subtle px-2 py-0.5 rounded-full font-medium">
                    Klik Topik di Bawah
                  </span>
                </div>

                {/* Concept Switcher Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  {THERMOCHEM_CONCEPTS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveConcept(c.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        activeConcept === c.id
                          ? 'border-chem-sage bg-chem-glow/40 shadow-xs font-semibold text-chem-forest'
                          : 'border-chem-border bg-chem-subtle/50 text-chem-ash hover:border-chem-sage/60 hover:text-chem-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${c.icon} text-xs ${activeConcept === c.id ? 'text-chem-sage' : 'text-chem-ash'}`}></i>
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Concept Details Card */}
                <div className="p-4 rounded-2xl bg-chem-subtle/70 border border-chem-border/80 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-chem-sage">
                        {selectedConcept.badge}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-chem-dark">
                        {selectedConcept.name}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2 py-1 rounded-lg bg-white border border-chem-border text-chem-forest">
                      {selectedConcept.formula}
                    </span>
                  </div>

                  <p className="text-xs text-chem-ash leading-relaxed">
                    {selectedConcept.summary}
                  </p>

                  <div className="pt-2 border-t border-chem-border/60">
                    <span className="block text-[11px] font-semibold text-chem-dark mb-2">
                      Fokus Pembahasan Inti:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedConcept.keyPoints.map((s) => (
                        <div key={s.step} className="p-2 rounded-xl bg-white border border-chem-border/60 text-[11px]">
                          <span className="font-bold text-chem-forest block mb-0.5">
                            {s.step}. {s.title}
                          </span>
                          <span className="text-chem-ash text-[10px] leading-tight line-clamp-2">
                            {s.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-chem-ash">
                    Login untuk modul lengkap & simulator kuis
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/materi');
                      } else {
                        navigate('/auth/login');
                      }
                    }}
                    className="px-4 py-2 bg-chem-forest hover:bg-chem-dark text-chem-glow text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Pelajari Lengkap</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: TENTANG TERMOKIMIA & PENDEKATAN BELAJAR */}
      <section id="tentang" className="py-20 bg-white/80 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Pendekatan Pedagogis Termokimia
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              Mengapa Siswa Perlu Mempelajari Termokimia?
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              Termokimia bukan sekadar rumus matematika kimia. Ini adalah studi fundamental mengenai bagaimana energi kalor menggerakkan setiap reaksi di alam semesta—mulai dari pembakaran bahan bakar hingga metabolisme sel tubuh kita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-chem-paper border border-chem-border shadow-subtle space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-lg border border-chem-border/70 shadow-xs">
                <i className="fa-solid fa-arrows-split-up-and-left"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-chem-dark">
                Distingsi Konseptual yang Jelas
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Membedakan dengan tegas antara sistem reaksi dan lingkungan, serta arti fisis dari tanda perubahan entalpi (ΔH negatif untuk eksoterm dan positif untuk endoterm) sehingga siswa tidak terjebak hafalan rumus mekanis.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-chem-paper border border-chem-border shadow-subtle space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-lg border border-chem-border/70 shadow-xs">
                <i className="fa-solid fa-scale-balanced"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-chem-dark">
                Kombinasi Logika Matematika & Eksperimen
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Menyajikan metode penentuan kalor secara seimbang: eksperimen nyata berbasis kalorimetri ($q = m \cdot c \cdot \Delta T$) dipadukan dengan logika aljabar Hukum Hess dan data energi ikatan rata-rata.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-chem-paper border border-chem-border shadow-subtle space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-lg border border-chem-border/70 shadow-xs">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-chem-dark">
                Aplikasi Kontekstual Dunia Nyata
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Mengaitkan konsep entalpi dengan efisiensi bahan bakar fosil dan terbarukan, kompres medis cepat, reaksi pembakaran mesin kendaraan, dan manajemen energi dalam industri kimia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: PILAR MATERI TERMOKIMIA */}
      <section id="konsep" className="py-20 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Peta Konsep Termokimia Lengkap
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              4 Pilar Utama yang Dipelajari di ChemCycle
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              Materi disusun secara terstruktur sesuai kompetensi Kimia SMA/MA, membimbing siswa dari pemahaman konsep kualitatif hingga perhitungan kuantitatif akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {THERMOCHEM_CONCEPTS.map((concept) => (
              <div
                key={concept.id}
                className="p-7 rounded-3xl bg-white border border-chem-border shadow-subtle hover:shadow-float transition-all space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-chem-border/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chem-subtle text-chem-forest flex items-center justify-center text-sm border border-chem-border/60">
                      <i className={`fa-solid ${concept.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-chem-dark">
                        {concept.name}
                      </h3>
                      <span className="text-[11px] text-chem-ash font-medium">
                        {concept.badge}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-chem-subtle border border-chem-border text-chem-forest">
                    {concept.formula}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-chem-dark">Fokus Konsep: </span>
                    <span className="text-chem-ash">{concept.focus}</span>
                  </div>
                  <p className="text-chem-ash leading-relaxed">
                    {concept.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-chem-border/60">
                  <span className="block text-[11px] font-semibold text-chem-forest mb-2">
                    Sub-topik Bahasan:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {concept.keyPoints.map((s) => (
                      <div key={s.step} className="p-2.5 rounded-xl bg-chem-paper border border-chem-border/50 text-[10px]">
                        <span className="font-bold text-chem-dark block">
                          {s.step}. {s.title}
                        </span>
                        <span className="text-chem-ash line-clamp-2 mt-0.5">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-chem-ash text-[11px] italic">
                    Penerapan: {concept.application}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/materi');
                      } else {
                        navigate('/auth/login');
                      }
                    }}
                    className="text-xs font-bold text-chem-forest hover:text-chem-dark inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pelajari Modul</span>
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION: FITUR-FITUR UNGGULAN APLIKASI */}
      <section id="fitur" className="py-20 bg-white/70 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Fitur Unggulan Platform
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              Pengalaman Belajar Termokimia yang Menyeluruh
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              Dari pembacaan materi interaktif hingga pengujian pemahaman mandiri, ChemCycle dirancang untuk mendukung penguasaan kimia secara optimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Modul Notion-Style & Diagram Entalpi
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Materi terstruktur rapi dengan format blok teks, persamaan reaksi termokimia bertingkat, diagram energi potensial, dan catatan konsep penting.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Dilengkapi Mode Zen Reader
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Zen Quiz & Uji Pemahaman Mandiri
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Kerjakan latihan kuis tanpa tekanan waktu. Dilengkapi kunci jawaban instan, evaluasi passing grade, serta penjelasan ilmiah mendalam di tiap nomor.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Penjelasan Langkah Perhitungan
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-flask"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Instruksi Aktivitas Praktikum (PBL)
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Panduan lembar kerja praktikum penentuan kalor reaksi menggunakan kalorimeter sederhana, investigasi pelarutan eksotermik/endotermik, dan studi kasus.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Pendekatan Problem-Based Learning
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-comments"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Forum Komunitas Diskusi Termokimia
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Ajukan pertanyaan mengenai soal-soal Hukum Hess yang menantang, diskusikan hasil percobaan kalorimeter, dan dapatkan bimbingan langsung dari guru.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Thread Komentar Interaktif
                </span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-gauge-high"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Dasbor Kemajuan & Analitik Belajar
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Pantau modul yang telah dibaca, statistik skor kuis, perolehan nilai rata-rata, dan keterlibatan penyelesaian tugas kelas secara real-time.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Pelacakan Kompetensi Terukur
                </span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-chem-paper rounded-3xl border border-chem-border shadow-subtle hover:border-chem-sage/60 transition-all space-y-3.5">
              <div className="w-10 h-10 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center text-base">
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Studio Bahan Ajar Khusus Guru
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Guru kimia dapat mengedit dan menambah materi menggunakan block editor, membuat bank soal kuis, serta memantau pengerjaan siswa secara mendalam.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-chem-forest inline-flex items-center gap-1">
                  <i className="fa-solid fa-check text-chem-mint text-[10px]"></i> Fleksibel untuk RPP / Modul Ajar
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: ALUR PEMBELAJARAN (4 LANGKAH BELAJAR) */}
      <section id="alur" className="py-20 border-b border-chem-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-chem-sage uppercase tracking-wider">
              ✦ Metodologi Pembelajaran
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-chem-dark">
              4 Langkah Menguasai Termokimia Tanpa Cemas
            </h2>
            <p className="text-sm text-chem-ash leading-relaxed">
              Dirancang dengan alur bertahap (*scaffolding*) agar siswa memupuk pemahaman konsep dari dasar hingga mahir memecahkan soal perhitungan entalpi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-chem-border shadow-subtle space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-serif text-base font-bold text-chem-dark">
                Pahami Sistem & Kalor
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Baca modul materi interaktif untuk memahami konsep dasar sistem, lingkungan, serta mengapa suatu reaksi melepaskan atau menyerap kalor.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-chem-border shadow-subtle space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-serif text-base font-bold text-chem-dark">
                Simulasi Kalorimeter (PBL)
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Pelajari instruksi praktikum penentuan kalor reaksi menggunakan kalorimeter sederhana, catat perubahan suhu, dan hitung nilai kalor reaksinya.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-chem-border shadow-subtle space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-serif text-base font-bold text-chem-dark">
                Uji Pemahaman Mandiri
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Kerjakan latihan kuis Zen yang tenang. Uji kemampuan menghitung nilai ΔH dengan Hukum Hess dan telusuri pembahasan lengkap tiap butir soal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-chem-border shadow-subtle space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-chem-glow text-chem-forest flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-serif text-base font-bold text-chem-dark">
                Diskusi & Pemecahan Masalah
              </h3>
              <p className="text-xs text-chem-ash leading-relaxed">
                Konsultasikan konsep yang belum dipahami di forum diskusi komunitas untuk mendapatkan tanggapan dari guru dan rekan belajar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: DUA PERAN (SISWA & GURU) */}
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
                Belajar mandiri dengan ritme sendiri (self-paced) tanpa rasa takut salah. Akses bahan ajar termokimia, kerjakan kuis latihan formatif dengan pembahasan komprehensif, dan pantau histori perkembangan nilai di dashboard pribadi.
              </p>

              <div className="space-y-3 border-t border-chem-border/70 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Akses modul konsep termokimia lengkap kapan pun</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Kuis latihan mandiri dengan pembahasan ilmiah instan</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Unduh panduan tugas & praktikum kalorimeter sederhana</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Forum diskusi tanya jawab kimia yang bersahabat</span>
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
                Kelola bahan ajar dan evaluasi termokimia dengan efisien. Rancang modul dengan block editor, susun bank soal kuis pilihan ganda beserta kunci dan pembahasannya, serta monitor pemahaman siswa secara real-time.
              </p>

              <div className="space-y-3 border-t border-chem-border/70 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Block Editor Notion-Style untuk menyusun bahan ajar kimia</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Studio pembuatan kuis termokimia dan kunci jawaban</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Pemantauan skor dan riwayat pengerjaan kuis siswa real-time</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-chem-dark">
                  <i className="fa-solid fa-circle-check text-chem-mint"></i>
                  <span>Pusat instruksi tugas eksperimen dan studi kasus kelas</span>
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
              Temukan informasi seputar kurikulum, materi termokimia, dan akses platform.
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
            <span>Tingkatkan Pemahaman Termokimia Anda Sekarang</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
            Siap Menguasai Konsep Kalor & <br />
            <span className="italic text-chem-mint">Perubahan Entalpi Kimia?</span>
          </h2>

          <p className="text-xs sm:text-sm text-chem-glow/80 max-w-2xl mx-auto leading-relaxed">
            Daftarkan akun sekarang untuk membuka modul termokimia terstruktur, mencoba kuis Zen dengan kunci dan pembahasan, serta berdiskusi bersama teman dan guru.
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
                Platform pembelajaran termokimia SMA/MA interaktif yang mengintegrasikan modul editorial Notion-style, kuis adaptif tanpa cemas, instruksi eksperimen kalorimeter, dan komunitas diskusi ilmiah.
              </p>
              <div className="flex items-center gap-2 text-xs text-chem-forest font-semibold">
                <i className="fa-solid fa-atom text-chem-sage"></i>
                <span>Kurikulum Merdeka & K13 — Kimia SMA/MA Fase F</span>
              </div>
            </div>

            {/* Column 2: Navigasi Cepat */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-chem-dark">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('tentang')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Tentang Aplikasi
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('konsep')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Materi Termokimia
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fitur')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Fitur Unggulan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('alur')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Alur Pembelajaran
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-chem-dark transition-colors cursor-pointer"
                  >
                    Tanya Jawab (FAQ)
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
              Thermochemistry Learning Atelier — Media Pembelajaran Kimia SMA
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
