import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { Badge } from '../ui/badge';
import {
  Menu,
  X,
  BookOpen,
  HelpCircle,
  Calendar,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  Atom,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { mobileNavOpen, toggleMobileNav, setMobileNavOpen } = useUiStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, authOnly: true },
    { name: 'Materi', path: '/materi', icon: BookOpen },
    { name: 'Latihan Soal', path: '/latihan', icon: HelpCircle },
    { name: 'Aktivitas', path: '/aktivitas', icon: Calendar },
    { name: 'Diskusi', path: '/diskusi', icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="flex items-center space-x-2.5 group"
          onClick={() => setMobileNavOpen(false)}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Atom className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Chem<span className="text-indigo-600">Cycle</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-1.5 transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Auth Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {user.fullName}
                  </div>
                  <Badge variant={user.role === 'admin' ? 'teacher' : 'student'}>
                    {user.role === 'admin' ? 'Guru' : 'Siswa'}
                  </Badge>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Keluar Akun"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/auth/register"
                className="px-3.5 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleMobileNav}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {isAuthenticated && user && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{user.fullName}</div>
                  <Badge variant={user.role === 'admin' ? 'teacher' : 'student'}>
                    {user.role === 'admin' ? 'Guru' : 'Siswa'}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  handleLogout();
                }}
                className="text-xs font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
              >
                Keluar
              </button>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-2.5 transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Pengaturan Akun</span>
              </Link>
            )}

            {!isAuthenticated && (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Masuk Akun
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Daftar Akun Baru
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
