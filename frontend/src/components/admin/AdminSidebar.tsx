import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import { useUIStore } from "../../store/uiStore";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/materi", label: "Manajemen Materi", icon: BookOpen },
  { to: "/admin/aktivitas", label: "Manajemen Aktivitas", icon: FlaskConical },
  { to: "/admin/kuis", label: "Latihan Soal & Bank Soal", icon: CheckCircle2 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, settings } = useDataStore();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    closeMobileSidebar,
  } = useUIStore();

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    navigate("/admin/login");
  };

  const collapsed = sidebarCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity md:hidden ${
          mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between bg-chem-dark text-white border-r border-chem-forest/40 transition-all duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-20" : "md:w-64"} w-64 shrink-0`}
      >
        {/* Collapse / close controls */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden md:flex absolute -right-3 top-8 z-10 h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-chem-forest text-white/80 shadow-subtle transition-colors hover:text-white hover:bg-chem-moss cursor-pointer"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Tutup sidebar"
          className="md:hidden absolute right-3 top-6 h-7 w-7 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className={`space-y-6 overflow-y-auto ${collapsed ? "p-3" : "p-6"}`}
        >
          {/* Brand & Admin Badge */}
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="w-10 h-10 rounded-2xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6 text-chem-mint" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-serif italic text-lg font-medium tracking-tight text-white block">
                  Eco
                  <span className="font-sans font-bold not-italic text-chem-mint">
                    CMS
                  </span>
                </span>
                <span className="text-[10px] text-chem-glow/70 uppercase tracking-wider font-mono">
                  Admin Panel v2.0
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav
            className={`space-y-1.5 pt-2 ${collapsed ? "flex flex-col items-center" : ""}`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  onClick={closeMobileSidebar}
                  className={`flex items-center rounded-2xl text-xs font-semibold transition-all ${
                    collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"
                  } ${
                    active
                      ? "bg-chem-forest text-white shadow-xs border border-chem-mint/30"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-chem-glow" : "text-white/60"}`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User profile & Public Portal link */}
        <div
          className={`border-t border-white/10 space-y-4 ${collapsed ? "p-3" : "p-6"}`}
        >
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <img
              src={settings.adminProfile.avatarUrl}
              alt={settings.adminProfile.name}
              title={collapsed ? settings.adminProfile.name : undefined}
              className="w-9 h-9 rounded-full object-cover border border-chem-mint/40 shrink-0"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">
                  {settings.adminProfile.name}
                </span>
                <span className="text-[10px] text-chem-glow/70 block truncate">
                  {settings.adminProfile.role}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
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
                <span className="text-[10px] bg-chem-forest px-1.5 py-0.5 rounded text-chem-glow">
                  Live
                </span>
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
          )}

          {collapsed && (
            <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-white/10">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Lihat Portal Publik"
                className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar Sesi (Logout)"
                aria-label="Keluar Sesi (Logout)"
                className="p-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
