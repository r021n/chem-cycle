import React from "react";
import { Link } from "react-router-dom";
import { useAccessibilityStore } from "../../store/accessibilityStore";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const { language } = useAccessibilityStore();

  return (
    <footer className="bg-chem-dark text-white border-t border-chem-forest/40 pt-12 pb-10 sm:pt-16 sm:pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 pb-10 sm:pb-12 border-b border-white/10">
          {/* Identity & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-chem-forest text-chem-glow flex items-center justify-center">
                <svg
                  className="w-5 h-5 spin-orbital"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <ellipse
                    cx="12"
                    cy="12"
                    rx="9"
                    ry="3.5"
                    transform="rotate(30 12 12)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <ellipse
                    cx="12"
                    cy="12"
                    rx="9"
                    ry="3.5"
                    transform="rotate(-30 12 12)"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="font-serif italic text-xl font-medium tracking-tight text-white">
                Eco
                <span className="font-sans font-bold not-italic text-chem-mint">
                  Inclusive
                </span>
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-md">
              {language === "id"
                ? "Platform pembelajaran kimia sirkular dan hijau berbasis Universal Design for Learning (UDL) untuk pendidikan sains yang adil dan terbuka."
                : "Circular & green chemistry learning portal based on Universal Design for Learning (UDL) for equitable, open science education."}
            </p>
          </div>

          {/* Navigasi Utama */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-chem-mint">
              {language === "id" ? "Navigasi Portal" : "Navigation"}
            </h4>
            <ul className="space-y-2.5 sm:space-y-2 text-xs text-white/70">
              <li>
                <Link to="/" className="hover:text-chem-glow transition-colors inline-flex min-h-8 items-center">
                  {language === "id" ? "Beranda" : "Home"}
                </Link>
              </li>
              <li>
                <Link
                  to="/materi"
                  className="hover:text-chem-glow transition-colors inline-flex min-h-8 items-center"
                >
                  {language === "id" ? "Materi" : "Materials"}
                </Link>
              </li>
              <li>
                <Link
                  to="/aktivitas"
                  className="hover:text-chem-glow transition-colors inline-flex min-h-8 items-center"
                >
                  {language === "id" ? "Aktivitas" : "Activities"}
                </Link>
              </li>
              <li>
                <Link
                  to="/kuis"
                  className="hover:text-chem-glow transition-colors inline-flex min-h-8 items-center"
                >
                  {language === "id" ? "Kuis" : "Quizzes"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Atribusi & Kelola */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-chem-mint">
              {language === "id" ? "Atribusi & Pengelola" : "Attribution & CMS"}
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link
                  to="/admin/login"
                  className="hover:text-chem-glow transition-colors inline-flex min-h-8 items-center"
                >
                  {language === "id" ? "Pengelola CMS" : "Admin CMS"}
                </Link>
              </li>
              <li>
                <span className="text-white/50 text-[11px]">
                  Lisensi: Creative Commons CC-BY-SA 4.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and metadata */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] text-white/50 text-center sm:text-left">
          <p>© {new Date().getFullYear()} EcoInclusive. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dirancang dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline mx-0.5" />
            <span>untuk pembelajaran sains inklusif.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
