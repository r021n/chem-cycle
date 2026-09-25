import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, settings } = useDataStore();

  // Route guard
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/materi', label: 'Manajemen Materi', icon: BookOpen },
    { to: '/admin/aktivitas', label: 'Manajemen Aktivitas', icon: FlaskConical },
    { to: '/admin/kuis', label: 'Latihan Soal & Bank Soal', icon: CheckCircle2 },
    { to: '/admin/pengaturan', label: 'Pengaturan Beranda & CMS', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-chem-dark text-white flex flex-col justify-between shrink-0 border-r border-chem-forest/40">
        <div className="p-6 space-y-6">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-chem-mint" />
            </div>
            <div>
              <span className="font-serif italic text-lg font-medium tracking-tight text-white block">
                Eco<span className="font-sans font-bold not-italic text-chem-mint">CMS</span>
              </span>
              <span className="text-[10px] text-chem-glow/70 uppercase tracking-wider font-mono">
                Admin Panel v2.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-chem-forest text-white shadow-xs border border-chem-mint/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-chem-glow' : 'text-white/60'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User profile & Public Portal link */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={settings.adminProfile.avatarUrl}
              alt={settings.adminProfile.name}
              className="w-9 h-9 rounded-full object-cover border border-chem-mint/40"
            />
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {settings.adminProfile.name}
              </span>
              <span className="text-[10px] text-chem-glow/70 block truncate">
                {settings.adminProfile.role}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Portal Publik</span>
              </span>
              <span className="text-[10px] bg-chem-forest px-1.5 py-0.5 rounded text-chem-glow">Live</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer text-left font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi (Logout)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-slate-50 p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
};
