import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Menu,
  X,
  Accessibility,
  Home,
} from "lucide-react";
import { useAccessibilityStore } from "../../store/accessibilityStore";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleOpen, language } = useAccessibilityStore();

  const navItems = [
    {
      to: "/",
      label: language === "id" ? "Beranda" : "Home",
      icon: Home,
    },
    {
      to: "/materi",
      label: language === "id" ? "Katalog Materi" : "Materials",
      icon: BookOpen,
    },
    {
      to: "/aktivitas",
      label: language === "id" ? "Modul Aktivitas" : "Activities",
      icon: FlaskConical,
    },
    {
      to: "/kuis",
      label: language === "id" ? "Latihan Soal" : "Quizzes",
      icon: CheckCircle2,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-chem-paper/95 backdrop-blur-md border-b border-chem-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <Link
          to="/"
          className="flex items-center gap-3.5 group select-none text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
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
          <div>
            <span className="font-serif italic text-xl font-medium tracking-tight text-chem-dark">
              Eco
              <span className="font-sans font-bold not-italic text-chem-sage tracking-normal">
                Inclusive
              </span>
            </span>
            <span className="hidden sm:block text-[10px] font-sans font-semibold tracking-wider uppercase text-chem-ash">
              {language === "id"
                ? "Platform Pembelajaran Kimia Sirkular"
                : "Circular Chemistry Learning"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  active
                    ? "bg-chem-forest text-white shadow-xs"
                    : "text-chem-ash hover:text-chem-forest hover:bg-chem-subtle"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-chem-glow" : "text-chem-sage"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleOpen}
            className="min-h-11 min-w-11 flex items-center justify-center text-chem-forest bg-chem-glow/70 rounded-xl border border-chem-sage/40"
            title="Aksesibilitas"
            aria-label="Pengaturan Aksesibilitas"
          >
            <Accessibility className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-11 min-w-11 flex items-center justify-center text-chem-ash hover:text-chem-dark bg-chem-subtle rounded-xl border border-chem-border cursor-pointer"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-chem-border bg-chem-paper/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 min-h-12 rounded-2xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-chem-forest text-white"
                    : "text-chem-dark hover:bg-chem-subtle"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${active ? "text-chem-glow" : "text-chem-sage"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-chem-border/70 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                toggleOpen();
              }}
              className="flex items-center justify-center gap-2 w-full min-h-12 bg-chem-glow/70 text-chem-forest text-sm font-bold rounded-2xl border border-chem-sage/40"
            >
              <Accessibility className="w-5 h-5" />
              <span>Pengaturan Aksesibilitas UDL</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
