import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { useUiStore } from "../../stores/ui-store";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    clearAuth();
    addToast("Anda telah keluar dari akun.", "info");
    navigate("/auth/login");
    onCloseMobile();
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard Belajar",
      icon: "fa-gauge-high",
    },
    {
      to: "/materi",
      label: "Materi & Catatan",
      icon: "fa-book-open",
    },
    {
      to: "/latihan",
      label: "Latihan & Evaluasi",
      icon: "fa-circle-check",
    },
    {
      to: "/aktivitas",
      label: "Instruksi Kelas",
      icon: "fa-bullhorn",
    },
    {
      to: "/diskusi",
      label: "Komunitas Diskusi",
      icon: "fa-comments",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-chem-dark/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`w-64 bg-chem-paper/95 backdrop-blur-md border-r border-chem-border flex flex-col shrink-0 z-40 transition-transform duration-300 fixed md:static inset-y-0 left-0 ${
          mobileOpen
            ? "translate-x-0 shadow-float"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-chem-border/70 shrink-0">
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none"
            onClick={() => {
              navigate("/dashboard");
              onCloseMobile();
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-chem-forest text-chem-glow flex items-center justify-center relative shadow-xs">
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
              <span className="font-serif italic text-lg font-medium tracking-tight text-chem-dark">
                Chem
                <span className="font-sans font-bold not-italic text-chem-sage tracking-normal">
                  Cycle
                </span>
              </span>
              <span className="block text-[10px] font-sans font-semibold tracking-wider uppercase text-chem-ash">
                Pembelajaran Termokimia
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-chem-ash hover:bg-chem-subtle cursor-pointer"
            aria-label="Tutup Menu"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3.5 text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash/70 mb-2">
            Navigasi Utama
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? "font-semibold text-chem-dark bg-chem-subtle shadow-2xs"
                    : "font-medium text-chem-ash hover:bg-chem-subtle hover:text-chem-dark"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <i
                    className={`fa-solid ${item.icon} w-4 text-center ${isActive ? "text-chem-sage" : "text-chem-ash"}`}
                  ></i>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Public Landing Link */}
          <div className="pt-2">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-chem-ash hover:bg-chem-subtle hover:text-chem-dark transition-all"
            >
              <i className="fa-solid fa-arrow-up-right-from-square w-4 text-center text-chem-sage"></i>
              <span>Lihat Beranda Publik</span>
            </Link>
          </div>

          {/* Account Group */}
          <div className="pt-4 mt-4 border-t border-chem-border/60 space-y-1.5">
            <p className="px-3.5 text-[10px] font-sans font-bold uppercase tracking-wider text-chem-ash/70 mb-2">
              Akun & Autentikasi
            </p>

            {isAuthenticated && user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "font-semibold text-chem-dark bg-chem-subtle shadow-2xs"
                        : "font-medium text-chem-ash hover:bg-chem-subtle hover:text-chem-dark"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i
                        className={`fa-solid fa-user w-4 text-center ${isActive ? "text-chem-sage" : "text-chem-ash"}`}
                      ></i>
                      <span>Profil & Kredensial</span>
                    </>
                  )}
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
                  <span>Keluar Akun (Logout)</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/auth/login"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "font-semibold text-chem-dark bg-chem-subtle shadow-2xs"
                        : "font-medium text-chem-ash hover:bg-chem-subtle hover:text-chem-dark"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i
                        className={`fa-solid fa-right-to-bracket w-4 text-center ${isActive ? "text-chem-sage" : "text-chem-ash"}`}
                      ></i>
                      <span>Masuk Akun (Login)</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/auth/register"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "font-semibold text-chem-dark bg-chem-subtle shadow-2xs"
                        : "font-medium text-chem-ash hover:bg-chem-subtle hover:text-chem-dark"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <i
                        className={`fa-solid fa-user-plus w-4 text-center ${isActive ? "text-chem-sage" : "text-chem-ash"}`}
                      ></i>
                      <span>Daftar Akun (Register)</span>
                    </>
                  )}
                </NavLink>
              </>
            )}
          </div>
        </nav>

        {/* User Card */}
        {isAuthenticated && user ? (
          <div className="p-3.5 border-t border-chem-border/70 bg-white/70 m-3 rounded-2xl border border-chem-border/80">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-chem-ash font-medium">Status:</span>
              <span
                id="roleIndicator"
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? "bg-chem-forest text-chem-glow"
                    : "bg-chem-subtle text-chem-forest border border-chem-border"
                }`}
              >
                {isAdmin ? "Admin / Guru" : "Siswa"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 border-t border-chem-border/70 bg-white/70 m-3 rounded-2xl border border-chem-border/80 space-y-2 text-center">
            <p className="text-[11px] text-chem-ash font-medium">
              Belum masuk ke akun?
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/auth/login"
                onClick={onCloseMobile}
                className="py-1.5 px-2 bg-chem-subtle text-chem-dark text-xs font-semibold rounded-xl hover:bg-chem-glow/60 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/auth/register"
                onClick={onCloseMobile}
                className="py-1.5 px-2 bg-chem-forest text-chem-glow text-xs font-semibold rounded-xl hover:bg-chem-dark transition-colors shadow-xs"
              >
                Daftar
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
