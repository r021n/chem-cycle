import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Accessibility,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { useDataStore } from '../../store/dataStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleOpen, language } = useAccessibilityStore();
  const { isAuthenticated } = useDataStore();

  const navItems = [
    {
      to: '/',
      label: language === 'id' ? 'Beranda' : 'Home',
      icon: Home,
    },
    {
      to: '/materi',
      label: language === 'id' ? 'Katalog Materi' : 'Materials',
      icon: BookOpen,
    },
    {
      to: '/aktivitas',
      label: language === 'id' ? 'Modul Aktivitas' : 'Activities',
      icon: FlaskConical,
    },
    {
      to: '/kuis',
      label: language === 'id' ? 'Latihan Soal' : 'Quizzes',
      icon: CheckCircle2,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-chem-paper/95 backdrop-blur-md border-b border-chem-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link
          to="/"
          className="flex items-center gap-3.5 group select-none text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <svg className="w-5 h-5 spin-orbital" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" strokeDasharray="2 2" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="font-serif italic text-xl font-medium tracking-tight text-chem-dark">
              Eco<span className="font-sans font-bold not-italic text-chem-sage tracking-normal">Inclusive</span>
            </span>
            <span className="hidden sm:block text-[10px] font-sans font-semibold tracking-wider uppercase text-chem-ash">
              {language === 'id' ? 'Platform Pembelajaran Kimia Sirkular' : 'Circular Chemistry Learning'}
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
                    ? 'bg-chem-forest text-white shadow-xs'
                    : 'text-chem-ash hover:text-chem-forest hover:bg-chem-subtle'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-chem-glow' : 'text-chem-sage'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center space-x-2.5">
          {/* Accessibility Shortcut Button */}
          <button
            type="button"
            onClick={toggleOpen}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-chem-forest bg-chem-glow/60 hover:bg-chem-glow border border-chem-sage/30 rounded-xl transition-colors cursor-pointer"
            title="Aksesibilitas UDL (Alt+A)"
          >
            <Accessibility className="w-4 h-4 text-chem-forest" />
            <span className="hidden lg:inline">{language === 'id' ? 'Aksesibilitas' : 'Accessibility'}</span>
          </button>

          {/* Admin CMS Button */}
          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-chem-dark bg-chem-subtle hover:bg-chem-border/60 border border-chem-border rounded-xl transition-colors"
          >
            {isAuthenticated ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>CMS Panel</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-chem-ash" />
                <span>Admin CMS</span>
              </>
            )}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleOpen}
            className="p-2 text-chem-forest bg-chem-glow/70 rounded-xl border border-chem-sage/40"
            title="Aksesibilitas"
          >
            <Accessibility className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-chem-ash hover:text-chem-dark bg-chem-subtle rounded-xl border border-chem-border cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-chem-border bg-chem-paper/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-chem-forest text-white'
                    : 'text-chem-dark hover:bg-chem-subtle'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-chem-glow' : 'text-chem-sage'}`} />
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
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-chem-glow/70 text-chem-forest text-xs font-bold rounded-xl border border-chem-sage/40"
            >
              <Accessibility className="w-4 h-4" />
              <span>Pengaturan Aksesibilitas UDL</span>
            </button>

            <Link
              to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-chem-subtle text-chem-dark text-xs font-semibold rounded-xl border border-chem-border"
            >
              <Lock className="w-4 h-4 text-chem-ash" />
              <span>{isAuthenticated ? 'Masuk ke CMS Dashboard' : 'Login Administrator CMS'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
