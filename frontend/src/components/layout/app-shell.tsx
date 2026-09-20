import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api-client';
import { UserSession } from '../../types/auth';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token, updateUser } = useAuthStore();

  // Fresh session sync using GET /api/v1/auth/me
  useEffect(() => {
    if (token) {
      api
        .get<{ success: boolean; data: UserSession }>('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            updateUser(res.data);
          }
        })
        .catch(() => {
          // If token expired or invalid, keep existing local state or handle gracefully
        });
    }
  }, [token, updateUser]);

  return (
    <div className="h-full min-h-screen flex flex-col md:flex-row antialiased bg-chem-paper lab-grid-bg text-chem-dark selection:bg-chem-glow selection:text-chem-forest">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar onToggleMobile={() => setMobileOpen((prev) => !prev)} />

        {/* Viewport Content Area */}
        <main
          id="mainViewport"
          className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-8 focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
