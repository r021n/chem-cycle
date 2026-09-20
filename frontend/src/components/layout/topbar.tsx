import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api } from '../../lib/api-client';

interface TopbarProps {
  onToggleMobile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { addToast } = useUiStore();

  // Health check query (GET /api/v1/health)
  const { data: healthData } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => api.get<{ status: string; uptime: number }>('/health'),
    refetchInterval: 30000,
  });

  const isServerOnline = healthData?.status === 'ok';

  const handleLogout = () => {
    clearAuth();
    addToast('Anda telah keluar dari akun.', 'info');
    navigate('/auth/login');
  };

  const getPageTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'Dashboard Belajar';
    if (pathname.startsWith('/materi')) return 'Materi & Catatan';
    if (pathname.startsWith('/latihan')) return 'Latihan & Evaluasi';
    if (pathname.startsWith('/aktivitas')) return 'Instruksi Kelas';
    if (pathname.startsWith('/diskusi')) return 'Komunitas Diskusi';
    if (pathname.startsWith('/profile')) return 'Profil & Kredensial';
    return 'ChemCycle';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CC';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const currentTitle = getPageTitle(location.pathname);
  const displayName = user?.fullName || (user?.role === 'admin' ? 'Dr. Surya Wirawan' : 'Budi Pratama');
  const initials = getInitials(displayName);

  return (
    <header className="h-16 px-4 sm:px-8 md:px-10 flex items-center justify-between border-b border-chem-border/70 bg-chem-paper/80 backdrop-blur-sm shrink-0">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 text-chem-ash hover:text-chem-dark rounded-xl hover:bg-chem-subtle transition-colors cursor-pointer"
          aria-label="Buka Navigasi"
        >
          <i className="fa-solid fa-bars text-sm"></i>
        </button>

        <div className="flex items-center gap-2 text-xs font-sans">
          <span className="text-chem-ash">Halaman:</span>
          <span id="breadcrumbCurrent" className="font-semibold text-chem-dark">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right: Friendly status pill, Server health & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Real-time Health Check Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chem-subtle/80 border border-chem-border/70 text-[11px] font-sans font-medium text-chem-dark"
          title={isServerOnline ? `ChemCycle API Aktif (Uptime: ${Math.round(healthData?.uptime || 0)}s)` : 'Memeriksa koneksi server...'}
        >
          <span className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-[10px] uppercase font-bold text-chem-forest">
            {isServerOnline ? 'API Online' : 'Koneksi API'}
          </span>
        </div>

        {/* Learning Focus Pill */}
        <span className="hidden lg:inline-flex items-center gap-1.5 font-sans text-xs text-chem-forest bg-chem-glow/50 border border-chem-sage/30 px-3 py-1 rounded-full font-medium">
          <i className="fa-solid fa-fire text-amber-600 text-xs"></i>
          Termokimia & Energi
        </span>

        {/* User Avatar & Logout */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div
              onClick={() => navigate('/profile')}
              className="cursor-pointer flex items-center gap-2 pl-2 pr-2 py-1 rounded-full hover:bg-chem-subtle transition-colors"
              title="Buka Profil & Kredensial"
            >
              <div
                className="w-8 h-8 rounded-full bg-chem-forest text-chem-glow flex items-center justify-center font-sans text-xs font-bold shadow-xs"
                id="topAvatar"
              >
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left font-sans leading-none">
                <span className="text-xs font-semibold text-chem-dark truncate max-w-[130px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-chem-ash uppercase tracking-wider mt-0.5">
                  {user.role === 'admin' ? 'Guru' : 'Siswa'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari Akun (Logout)"
              className="p-2 rounded-xl text-chem-ash hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/auth/login"
              className="px-3 py-1.5 text-xs font-semibold text-chem-dark hover:text-chem-forest bg-chem-subtle rounded-xl transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/auth/register"
              className="px-3 py-1.5 text-xs font-semibold bg-chem-forest text-chem-glow rounded-xl hover:bg-chem-dark transition-colors shadow-xs"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
