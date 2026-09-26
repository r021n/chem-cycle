import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Menu, ShieldCheck } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useDataStore();
  const { mobileSidebarOpen, toggleMobileSidebar } = useUIStore();

  // Route guard
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Close the mobile sidebar drawer whenever the route changes
  React.useEffect(() => {
    useUIStore.getState().closeMobileSidebar();
  }, [location.pathname]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Universal Admin Sidebar (fixed viewport height, does not scroll with content) */}
      <AdminSidebar />

      {/* Main Admin Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile-only top bar (sidebar trigger) */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-chem-dark text-white border-b border-chem-forest/40">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label="Buka menu sidebar"
            aria-expanded={mobileSidebarOpen}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
            <span>Menu Admin</span>
          </button>
          <span className="flex items-center gap-2 text-xs font-serif italic tracking-tight">
            <ShieldCheck className="h-4 w-4 text-chem-mint not-italic" />
            Eco<span className="font-sans font-bold not-italic text-chem-mint">CMS</span>
          </span>
        </header>

        {/* Scrollable content area — the sidebar stays fixed while this scrolls */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-50 p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
